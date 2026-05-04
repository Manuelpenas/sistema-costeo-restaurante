# Script completo para subir a GitHub y desplegar en Vercel
# Autenticación
$token = Read-Host "Ingresa tu GitHub Personal Access Token" -AsSecureString
$tokenText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))
$env:GITHUB_TOKEN = $tokenText

# Configurar git
$env:USERNAME = Read-Host "Ingresa tu usuario de GitHub"

# Crear repositorio via API
$headers = @{
    "Authorization" = "token $env:GITHUB_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    name = "sistema-costeo-restaurante"
    description = "Sistema de costeo para restaurantes"
    homepage = "https://vercel.app"
    private = $false
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method POST -Headers $headers -Body $body
    Write-Host "Repositorio creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error al crear repositorio: $_" -ForegroundColor Red
    exit
}

# Configurar remote y push
cd "D:\DNAmic\DNAmic\Clientes\Katia\Restaurante"
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin "https://$env:USERNAME:$env:GITHUB_TOKEN@github.com/$env:USERNAME/sistema-costeo-restaurante.git"
git push -u origin master

Write-Host "Codigo subido a GitHub exitosamente" -ForegroundColor Green
Write-Host "Ahora ve a https://vercel.com/new e importa el repositorio" -ForegroundColor Yellow
Write-Host "URL esperada: https://sistema-costeo-restaurante.vercel.app" -ForegroundColor Cyan
