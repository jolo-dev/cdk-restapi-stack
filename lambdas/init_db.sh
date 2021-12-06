#!/bin/bash

awslocal --endpoint-url=http://localhost:4566 dynamodb create-table \
    --region eu-west-1 \
    --table-name Projects \
    --attribute-definitions \
        AttributeName=ID,AttributeType=S \
        AttributeName=CreationDateTime,AttributeType=S \
    --key-schema \
        AttributeName=ID,KeyType=HASH \
        AttributeName=CreationDateTime,KeyType=RANGE \
    --billing-mode \
        PAY_PER_REQUEST \
    --global-secondary-indexes \
        "[
            {
                \"IndexName\": \"ProjectGSI\",
                \"KeySchema\": [
                    {\"AttributeName\":\"ID\",\"KeyType\":\"HASH\"},
                    {\"AttributeName\":\"CreationDateTime\",\"KeyType\":\"RANGE\"}
                ],
                \"Projection\": {
                    \"ProjectionType\":\"KEYS_ONLY\"
                }
            }
        ]"