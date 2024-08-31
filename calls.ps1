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

# Define the searchArg object as a hashtable
$searchArg = @{
    limit = 10
    offset = 0
    order = "asc"
    descendants = $false
    field = "gene_symbol"
    op = "contains"
    val = "A"
    orderfield = "gene_symbol"
}

# Convert the hashtable to a JSON string
$searchArgJson = $searchArg | ConvertTo-Json -Compress

# Define the URL of the server route
$url = "http://127.0.0.1:3000/genes/search"

# Create the body of the POST request
$body = @{
    searchArg = $searchArgJson
} | ConvertTo-Json -Compress

# Make the POST request
$response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -Headers @{ Accept = "application/json" }

# Output the response
$response

# Define the search argument as a complex object
$searchArg = @{
    op = "AND"
    orderfield = "donor_age"
    order = "asc"
    limit = 10
    offset = 0
    descendants = @(
        @{
            op = "OR"  # Combine donor_age > 30 OR donor_ethnicity = 'Asian'
            descendants = @(
                @{
                    field = "donor_age"
                    op = ">"
                    val = 30
                },
                @{
                    field = "donor_ethnicity"
                    op = "="
                    val = "Asian"
                }
            )
        },
        @{
            field = "growth_pattern"
            op = "="
            val = "adherent"
        }
    )
}

# Define the search argument as a complex object
$searchArg = @{
    orderfield = "donor_age"
    order = "asc"
    limit = 10
    offset = 0
    descendants = @(
        @{
            op = "OR"  # Combine donor_age > 30 OR donor_ethnicity = 'Asian'
            descendants = @(
                @{
                    field = "donor_age"
                    op = ">"
                    val = 30
                },
                @{
                    field = "donor_ethnicity"
                    op = "="
                    val = "Asian"
                }
            )
            }
    )
}

# Convert the search argument to JSON for better readability (optional)
$searchArgJson = $searchArg | ConvertTo-Json -Depth 10

# Define the URL of the server route
$url = "http://127.0.0.1:3000/cells/search"

# Create the body of the POST request
$body = @{
    searchArg = $searchArgJson
} | ConvertTo-Json -Compress

# Make the POST request
$response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -Headers @{ Accept = "application/json" }
