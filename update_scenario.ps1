# 90plus Make.com Scenario Blueprint Updater (PATCH Method & Object Fixed)
$token = "420cae79-c2bd-4ef2-b15f-4556b7f8e940"
$scenarioId = "5178891"
$blueprintPath = "C:\Users\chltm\.gemini\antigravity\scratch\90-plus\blueprint.json"

# 1. Load Blueprint JSON
$rawJson = Get-Content -Path $blueprintPath -Raw | ConvertFrom-Json
$blueprint = $rawJson.response.blueprint

# 2. Modify Module 1: RSS Trigger URL
$rssModule = $blueprint.flow[0]
$rssModule.parameters.url = "https://www.caughtoffside.com/feed/"
Write-Host "[Info] RSS URL updated to CaughtOffside feed."

# 3. Modify Module 2: OpenAI System & User Prompt in MAPPER
$gptModule = $blueprint.flow[1]

# System Prompt
$systemPrompt = @"
당신은 유럽 축구 이적 시장 뉴스를 분석하여 데이터베이스에 맞게 정밀하게 가공하는 AI 에이전트입니다. 입력받은 영어 축구 뉴스 기사(RSS 피드 본문 및 제목)를 분석하고, 반드시 지켜야 하는 규칙에 따라 한국어로 가공한 뒤 아래의 JSON 형식으로만 응답해야 합니다.

[JSON 출력 형식]
{
  "title": "한글로 번역/요약된 세련된 기사 제목 (예: 빅토르 오시멘, PSG 이적 합의 완료)",
  "content": "한글로 매끄럽고 신뢰감 있게 작성된 뉴스 본문 전체",
  "reporter": "기자 이름 (예: Fabrizio Romano, David Ornstein 등) 또는 뉴스 출처 (예: CaughtOffside, BBC Sports)",
  "tier": 기자의 공신력 등급 (1에서 5 사이의 정수),
  "is_here_we_go": Fabrizio Romano의 'Here we go' 문구가 본문에 있거나 이적 합의 완료 상태면 true, 아니면 false,
  "category": "추천 뉴스", "최신뉴스", "이적소식", "전술분석" 중 가장 알맞은 카테고리 하나 선택,
  "tactic_grade": 전술 평점 객체 또는 null (예: { "managerA": { "name": "펩 과르디올라", "grade": "A+" }, "managerB": { "name": "미켈 아르테타", "grade": "B+" } })
}

[규칙]
- Fabrizio Romano, David Ornstein ➔ tier: 1
- Florian Plettenberg, James Pearce ➔ tier: 2
- 일반 메이저 스포츠 매체 ➔ tier: 3~4
- 황색 언론 ➔ tier: 5
- 다른 부가 설명이나 마크다운 블록(```json) 없이 오직 순수한 JSON만 리턴하시오.
"@

# User Prompt (Make's native syntax)
$userPrompt = @"
[입력 뉴스 제목]
{{1.title}}

[입력 뉴스 본문/요약]
{{1.description}}
"@

# Update system message content
$gptModule.mapper.messages[0].content = $systemPrompt

# Recreate the user message object completely to avoid property not found issues
$userMsg = [PSCustomObject]@{
    role = "user"
    content = $userPrompt
    imageDetail = "auto"
}

if ($gptModule.mapper.messages.Count -gt 1) {
    # Replace the existing user message object
    $gptModule.mapper.messages[1] = $userMsg
} else {
    $gptModule.mapper.messages += $userMsg
}

# Change response format in MAPPER to json_object
$gptModule.mapper.response_format = "json_object"

Write-Host "[Info] OpenAI System & User Prompt, and JSON Mode enabled."

# 4. Convert blueprint back to JSON String
# API v2 Scenario PATCH expects the blueprint inside a JSON-serialized format.
# Some Make.com endpoints expect blueprint as a stringified JSON string value, rather than a raw JSON object.
# We will send it as a raw object inside the "blueprint" property first.
$blueprintJson = $blueprint | ConvertTo-Json -Depth 15
$updateBodyObj = @{
    blueprint = $blueprintJson
}
$updateBody = $updateBodyObj | ConvertTo-Json

# 5. Call Make.com API to update Scenario (PATCH /api/v2/scenarios/{id})
$uri = "https://us2.make.com/api/v2/scenarios/$scenarioId"
$headers = @{
    "Authorization" = "Token $token"
    "Content-Type"  = "application/json"
}

Write-Host "[Info] Calling Make.com API to PATCH scenario..."
try {
    # Request method: PATCH
    $response = Invoke-RestMethod -Uri $uri -Method Patch -Headers $headers -Body $updateBody
    Write-Host "[Success] Scenario successfully updated!"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Error "Failed to update scenario: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errBody"
    }
}
