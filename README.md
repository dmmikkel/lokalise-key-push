# lokalise-key-push

Lets you automatically push new language keys to your Lokalise.co project.

## How to use
```yaml
name: Push keys to Lokalise

on:
  push:
    branches:
      - master
    paths:
     - 'src/main/resources/*.properties'

jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: dmmikkel/lokalise-key-push@v3.4
      with:
        api-token: ${{ secrets.lokalise_token }}
        project-id: 748610715d8afa5681a4b1.23888602
        directory: src/main/resources
        format: properties # json or properties
        platform: web # or android, ios, other
        filename: messages_%LANG_ISO%.properties

```

## License

The action is free to use, but the code is copyrighted.
