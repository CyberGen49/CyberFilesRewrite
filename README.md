# CyberFiles2
A capable and customizable Apache file index.

This project is a rewrite of my previous file index site, with some major improvements.

## Installation
We recommend using a Debian Linux-based system running Apache for hosting CyberFiles. If you're using a different operating system or webserver, you may need to do a bit more work to get everything working.

### Prepare an environment for CyberFiles
Create a new folder where you'll store the files you want to serve with CyberFiles. For example:
```bash
mkdir /path/to/cyberfiles
```
Remember this path, we'll use it again in a bit.

### Install CyberFiles
* Click the **Clome** button
* Choose **Download ZIP**
* Create a new folder named **_cyberfiles** in the root of your website (the folder you just created)
* Extract the downloaded .zip file into the new folder

### Set up Apache
Create a new Apache configuration file:
```bash
sudo nano /etc/apache2/sites-available/cyberfiles.conf
```
In the text editor, paste this example configuration:
```apache
<VirtualHost *:80>
    ServerName files.example.com
    Define dRoot /path/to/cyberfiles
    DocumentRoot ${dRoot}
    DirectoryIndex index.html index.php /_cyberfiles/public/index.php
    ErrorDocument 401 /_cyberfiles/public/index.php?error=401
    ErrorDocument 403 /_cyberfiles/public/index.php?error=403
    ErrorDocument 404 /_cyberfiles/public/index.php?error=404
    <Directory "${dRoot}">
        Require all granted
    </Directory>
</VirtualHost>
```
In the above configuration, change `files.example.com` to your domain, and `/path/to/cyberfiles` to the path of the folder you created earlier.

You can use online guides to help set up other features, such as SSL.

## CyberFiles configuration
To change settings for CyberFiles, open the configuration file located at `/_cyberfiles/private/config.yml`. Below is a description of each setting.

**Note:** Be sure to run the config file through a YAML checker [like this one](https://yamlchecker.com/) to be sure you didn't make any mistakes while editing.

### Settings list
*I haven't gotten around to adding this yet.*