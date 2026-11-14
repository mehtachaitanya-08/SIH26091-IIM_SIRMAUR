# Starts UdyamSetuAI with the data.gov.in key taken from the Windows user setting DATA_GOV_IN_API_KEY.
#
# WHY THIS FILE EXISTS (14 Nov 2026): the key is stored as a per-user Windows setting, never in the code
# and never in .env. A program started from an app that was already open can still hold an OLD copy of
# the user's settings, and then the server starts without the key and the price panel says "Coming soon"
# although the key is saved. This script reads the setting fresh and hands it to the server.
# It contains no key. start.bat does the rest (packages, website check, the Groq key from .env).
#
# Run from the project folder:   powershell -ExecutionPolicy Bypass -File .\run_with_saved_keys.ps1

$key = [Environment]::GetEnvironmentVariable('DATA_GOV_IN_API_KEY', 'User')
if ($key) {
    $env:DATA_GOV_IN_API_KEY = $key
    Write-Host "data.gov.in key: found in your Windows settings ($($key.Length) characters)."
} else {
    Write-Host "data.gov.in key: not set in your Windows settings. Mandi prices will say 'Coming soon'."
}
& (Join-Path $PSScriptRoot 'start.bat')
