# Start the Node.js application in the background
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "app.js"

# Give the server a moment to start
Start-Sleep -Seconds 5

# Define the API URL and data
$API_URL = "http://localhost:3000/cells"
$DATA = @{
    cell_iname = "MCF7"
    cellosaurusId = "CVCL_0031"
    donorAge = 70
    donorAgeDeath = 72
    donorDiseaseAgeOnset = 67
    doublingTime = 72
    growthMedium = "EMEM; 10% FBS ;.01mg/ml Bovine Insulin"
    providerCatalogId = "XYZ123"
    featureId = "c-438"
    cellType = "tumor"
    donorEthnicity = "Caucasian"
    donorSex = "F"
    donorTumorPhase = "Metastatic"
    cellLineage = "breast"
    primaryDisease = "breast cancer"
    subtype = "adenocarcinoma"
    providerName = "ATCC"
    growthPattern = "adherent"
    ccleName = "MCF7_BREAST"
    cellAlias = "IBMF-7"
} | ConvertTo-Json

# Make a POST request to create a new cell record
$response = Invoke-RestMethod -Method Post -Uri $API_URL -ContentType "application/json" -Body $DATA

# Output the response to the terminal
Write-Output "Response from POST /cells:"
Write-Output $response
