# Framework (frameworkdesktop4)

Framework by BITT

## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

### First time, should create file config.json in /public/config.json like this:
{
    "URL_Data": "https://your_public_site",
    "URL_Path": "/api/",
    "URL_Port": "",
    "URL_UX": "https://your_public_site",
    "URL_UX_Port": "",
    "serverFilesPath": "http://your_public_site/yourPublicPathToUploadedFiles/",
    "defaultUser": "",
    "defaultPassword": "",
    "ReportServer_Path": "https://yourPublicPath/SSRS_Reports_URL/report/",
    "ReportServer_BI_Path": "https://yourPublicPath/PBIRS_Reports_URL/powerbi/"
}
