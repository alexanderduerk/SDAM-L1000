# Define the API URL and data for creating a cell record
$API_URL = "http://127.0.0.1:3000/cells"  # Use 127.0.0.1 instead of localhost
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
Write-Output "Response from POST /cells:"
Write-Output $response

# Replace with your actual API URL
$apiUrl = "http://localhost:3000/cells"

# Sample search query
$searcharg = @{
    field = "cell_iname"
    op = "=="
    val = "MCF7"
} | ConvertTo-Json

# Send the POST request
$response = Invoke-RestMethod -Method Post -Uri $apiUrl -ContentType "application/json" -Body $searcharg

# Check the response status code
if ($response.StatusCode -eq 200) {
    Write-Host "Search successful"
    # Parse the response body to verify the results
} else {
    Write-Host "Search failed: $($response.StatusCode) $($response.StatusDescription)"
}