# Install nvm and use nvm to install latest version of node/npm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm install node
nvm use node

# Install git, clone repo, install packages
sudo yum install -y git
git clone https://github.com/sbernheim4/Personal-Website.git
cd Personal-Website

# Install yarn
curl -o- -L https://yarnpkg.com/install.sh | bash
yarn install

# Set up port forwarding. Redirect all incoming port 80 requests to port 8080
sudo iptables --insert INPUT --protocol tcp --dport 80 --jump ACCEPT
sudo iptables --insert INPUT --protocol tcp --dport 8080 --jump ACCEPT
sudo iptables --table nat --append PREROUTING --in-interface eth0 --protocol tcp --dport 80 --jump REDIRECT --to-port 8080
# run next line to have changes survive reboot
sudo service iptables save

# Start the application
npm start
