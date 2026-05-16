$content = Get-Content 'd:\app 0205\Code.gs' -Encoding UTF8
$startLine = 2052 # 0-indexed index for line 2053
$endLine = 3314 # 0-indexed index for line 3315
$newContent = $content[0..($startLine-1)] + $content[($endLine+1)..($content.Length-1)]
$newContent | Set-Content 'd:\app 0205\Code.gs' -Encoding UTF8
