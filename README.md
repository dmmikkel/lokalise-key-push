# lokalise-key-push
GitHub Action that pushes new translations keys to Lokalise

## How to use
```
name: Push keys to Lokalise

on:
  push:
    branches:
      - master
    paths:
     - i18n/*.json

jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: dmmikkel/lokalise-key-push@master
      with:
        api-token: ${{ secrets.lokalise_token }}
        project-id: 748610715d8afa5681a4b1.23888602
        directory: i18n
        file-extension: json
        key-name-property: web
        platforms: ios android web other
```
