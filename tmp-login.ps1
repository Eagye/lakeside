$html = (curl.exe -s -c .csrf-cookies.txt http://localhost:3000/admin/login)
$token = [regex]::Match($html,'csrf-token" content="([^"]+)"').Groups[1].Value
$body = "username=admin&password=admin123&_csrf=$token"
curl.exe -i -s -b .csrf-cookies.txt -H "Accept: text/html" -H "Content-Type: application/x-www-form-urlencoded" -d $body http://localhost:3000/admin/login | findstr /i "Set-Cookie"
