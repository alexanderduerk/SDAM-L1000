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

# search for the earlier inserted cell
$apiUrl = "http://127.0.0.1:3000/cells/search?field=cell_name&op==&val=SF9"
$response = Invoke-RestMethod -Method Get -Uri $apiUrl
# get the cell_id from the response
$cell_id = $response[0].cell_id

# update the earlier inserted cell
$apiUrl = "http://127.0.0.1:3000/cells"
$DATA = @{
    cellid = $cell_id
    columnname = "cell_name"
    newvalue = "High5"
} | ConvertTo-Json
$response = Invoke-RestMethod -Method Patch -Uri $apiUrl -ContentType "application/json" -Body $DATA

# delete the earlier inserted cell
$apiUrl = "http://127.0.0.1:3000/cells/$cell_id"
$response = Invoke-RestMethod -Method Delete -Uri $apiUrl

# Complex search argument with descriptive variable names
$searchArg = @{
    descendants = @(
        @{
            field = "growth_pattern"
            op = "="
            val = "adherent"
        },
        @{
            descendants = @(
                @{
                    field = "donor_age"
                    op = "<"
                    val = 20
                },
                @{
                    descendants = @(
                        @{
                            field = "donor_ethnicity"
                            op = "="
                            val = "Asian"
                        }
                    )
                    op = "AND"
                }
            )
            op = "OR"
        }
    )
    op = "AND"
}

# Convert the search argument to a JSON string
$jsonBody = $searchArg | ConvertTo-Json -Depth 10

# Output the JSON to verify
Write-Output $jsonBody

$apiUrl = "http://127.0.0.1:3000/cells/search"
$headers = @{
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $jsonBody