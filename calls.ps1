# Define the API URL and data for creating a cell record
$API_URL = "http://127.0.0.1:3000/cells"  # Use 127.0.0.1 instead of localhost
$DATA = @{
    cell_iname = "MCF7"
    cellosaurusId = "CVCL_0031"
    donorAge = 70
    donorAgeDeath = 72
    donorDiseaseAgeOnset = 67
    doublingTime = 72
    growthMedium = "EMEM"
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
Write-Output "Response from POST /cells:"
Write-Output $response


$apiUrl = "http://127.0.0.1:3000/cells/search?field=cell_iname&op==&val=MCF7"
$response = Invoke-RestMethod -Method Get -Uri $apiUrl