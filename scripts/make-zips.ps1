# Gera os ZIPs de demonstração com caminhos usando "/" (compatível com Mac, Linux e Netlify).
# Uso:  npm run build:demo ; powershell -File scripts\make-zips.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$root = Split-Path -Parent $PSScriptRoot

function New-Zip([string]$zipPath, [hashtable]$entries) {
  if (Test-Path $zipPath) { Remove-Item $zipPath -Confirm:$false }
  $zip = [IO.Compression.ZipFile]::Open($zipPath, 'Create')
  try {
    foreach ($name in ($entries.Keys | Sort-Object)) {
      [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $entries[$name], $name, 'Optimal')
    }
  } finally { $zip.Dispose() }
}

$build = Join-Path $root 'demo-build'
$files = @{
  'index.html'  = Join-Path $build 'index.html'
  'favicon.svg' = Join-Path $build 'favicon.svg'
}
Get-ChildItem (Join-Path $build 'carros') -File | ForEach-Object { $files["carros/$($_.Name)"] = $_.FullName }

# 1) Para o cliente abrir no computador: pasta Rifa-Premium-Demo/ + LEIA-ME.
$demo = @{}
foreach ($k in $files.Keys) { $demo["Rifa-Premium-Demo/$k"] = $files[$k] }
$demo['Rifa-Premium-Demo/LEIA-ME.txt'] = Join-Path $root 'demo-assets\LEIA-ME.txt'
New-Zip (Join-Path $root 'Rifa-Premium-Demo.zip') $demo

# 2) Para o Netlify Drop: arquivos na raiz.
New-Zip (Join-Path $root 'Rifa-Premium-Site.zip') $files

foreach ($z in 'Rifa-Premium-Demo.zip', 'Rifa-Premium-Site.zip') {
  $a = [IO.Compression.ZipFile]::OpenRead((Join-Path $root $z))
  "== $z"; $a.Entries | ForEach-Object { "  $($_.FullName)" }; $a.Dispose()
}
