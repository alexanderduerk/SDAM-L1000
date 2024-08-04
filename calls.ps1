# Define the API URL and data for creating a cell record
$API_URL = "http://127.0.0.1:3000/cells"  # Use 127.0.0.1 instead of localhost
$DATA = @{
    cell_name = "SF9"
    cellosaurus_id = "CVCL_0031"
    donor_age = 80
    growth_medium = "SF900"
    cell_type = "insect"
    donor_ethnicity = "Caucasian"
    donor_tumor_phase = "Metastatic"
    cell_lineage = "breast"
    primary_disease = "breast cancer"
    subtype_disease = "adenocarcinoma"
    provider_name = "ATCC"
    growth_pattern = "adherent"
} | ConvertTo-Json

# Make a POST request to create a new cell record
$response = Invoke-RestMethod -Method Post -Uri $API_URL -ContentType "application/json" -Body $DATA
Write-Output "Response from POST /cells:"
Write-Output $response

$DATA_MISSING = @{
    cell_name = "SF9"
    growth_medium = "SF900"
    cell_type = "insect"
    donor_ethnicity = "Caucasian"
    cell_lineage = "breast"
    primary_disease = "breast cancer"
    subtype_disease = "adenocarcinoma"
    provider_name = "ATCC"
    growth_pattern = "adherent"
} | ConvertTo-Json

# Make a POST request to create a new cell record
$response = Invoke-RestMethod -Method Post -Uri $API_URL -ContentType "application/json" -Body $DATA_MISSING
Write-Output "Response from POST /cells:"
Write-Output $response


$apiUrl = "http://127.0.0.1:3000/cells/search?field=cell_name&op==&val=MCF7"
$response = Invoke-RestMethod -Method Get -Uri $apiUrl

$apiUrl = "http://127.0.0.1:3000/cells/search?field=cell_name&op=contains&val=A"
$response = Invoke-RestMethod -Method Get -Uri $apiUrl

$apiUrl = "http://127.0.0.1:3000/cells/search?field=cell_name&op=startswith&val=A"
$response = Invoke-RestMethod -Method Get -Uri $apiUrl

$apiUrl = "http://127.0.0.1:3000/cells/search?field=cell_name&op=endswith&val=A"
$response = Invoke-RestMethod -Method Get -Uri $apiUrl

$apiUrl = "http://127.0.0.1:3000/cells/search?field=donor_age&op=<&val=5.0"
$response = Invoke-RestMethod -Method Get -Uri $apiUrl

# Make a delete request
#$API_URL = "http://127.0.0.1:3000/cells/MCF7"
#$response = Invoke-RestMethod -Method Delete -Uri $API_URL 