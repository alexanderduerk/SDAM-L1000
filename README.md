# SDAM L1000 Datamodel and Website

This project aims to create a proper sql implementation of the L1000 dataset, avilable within the browser using Node.js and html. The server structure is based on the express module.

## SQL L1000

## SQL Table structure

### Main search table:
#### instinfo
- pert_id
- cell_iname
- pert_type


#### siginfo
- ss_ngene
- tas

#### foreign keys
- cell_iname --> cell_info

#### primary key
- cell_iname = primary key


