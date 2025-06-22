#!/bin/bash

# Check if arguments were passed
if [ "$#" -eq 0 ]; then
    echo "No arguments provided."
    exit 1
fi

# Loop through all arguments
for arg in "$@"
do
    echo "$arg"
done
