# Script para subir a GitHub
cd "D:\DNAmic\DNAmic\Clientes\Katia\Restaurante"

# Crear repositorio via API
$headers = @{
    "Authorization" = "token $env:GITHUB_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    name = "sistema-costeo-restaurante"
    description = "Sistema de costeo para restaurantes"
    homepage = "https://vercel.app"
    @private = $false
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method POST -Headers $headers -Body $body
    Write-Host "Repositorio creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error al crear repositorio: $_" -ForegroundColor Red
}

# Configurar remote y push
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin https://$env:GITHUB_TOKEN@github.com/$env:USERNAME/sistema-costeo-restaurante.git
git push -u origin master

Write-Host "Codigo subido a GitHub exitosamente" -ForegroundColor Green
Write-Host "Ahora ve a https://vercel.com/new e importa el repositorio" -ForegroundColor Yellow
