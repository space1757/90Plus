# 90plus Lightweight PowerShell Static Web Server with ESM Support
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "[90PLUS Server] HTTP Server started at http://localhost:8080/"

while ($listener.IsListening) {
    $context = $null
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        # CORS 및 ESM 요청을 위한 헤더 설정
        $res.Headers.Add("Access-Control-Allow-Origin", "*")
        $res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if ($req.HttpMethod -eq "OPTIONS") {
            $res.StatusCode = 200
            $res.Close()
            continue
        }

        $localPath = $req.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        
        $baseDir = (Get-Location).Path
        $normalizedSubPath = $localPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = [System.IO.Path]::Combine($baseDir, $normalizedSubPath)
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css; charset=utf-8" }
                ".js" { "application/javascript; charset=utf-8" }
                default { "application/octet-stream" }
            }
            
            $res.ContentType = $contentType
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $res.ContentLength64 = $bytes.Length
            
            # 스트림 작성 및 명시적 닫기 (ProtocolViolation 예외 방지)
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.OutputStream.Close()
        } else {
            $res.StatusCode = 404
            $utf8 = New-Object System.Text.UTF8Encoding
            $bytes = $utf8.GetBytes("<h1>404 Not Found: $localPath</h1>")
            $res.ContentType = "text/html; charset=utf-8"
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.OutputStream.Close()
        }
    } catch {
        Write-Host "Server Error: $_"
    } finally {
        if ($context -ne $null) {
            try { $context.Response.Close() } catch {}
        }
    }
}
$listener.Stop()
