# lokalise-key-push

Lets you automatically push new language keys to your Lokalise.co project.

## How to use
```yaml
name: Push keys to Lokalise

on:
  push:
    # Only run workflow for pushes to specific branches
    branches:
      - master
    # Only run workflow when matching files are changed
    paths:
     - 'src/main/resources/*.properties'

jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: dmmikkel/lokalise-key-push@v3.4
      with:
        # Api token for the Lokalise account
        # with read/write access to the project
        api-token: ${{ secrets.lokalise_token }}
        
        # ID of the project to sync
        project-id: 748610715d8afa5681a4b1.23888602
        
        # The relative directory where language files will be found
        directory: src/main/resources

        # Which format to parse (json or properties)
        format: properties
        
        # Which platform to push new keys to
        platform: web # or android, ios, other
        
        # The filename new keys should be attached to
        filename: messages_%LANG_ISO%.properties

```

## License

The action is free to use, but the code is copyrighted.
