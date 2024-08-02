#!/bin/bash

# Update package list and install prerequisites
sudo apt-get update -y
sudo apt-get install -y curl apt-transport-https ca-certificates software-properties-common gnupg2

# Install Java JDK 21
sudo apt-get install -y openjdk-21-jdk

# Install Jenkins
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update -y
sudo apt-get install -y docker-ce
sudo usermod -aG docker ${USER}
sudo usermod -aG docker jenkins

# Install Node.js 22.3.0
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs=22.3.0-1nodesource1

# Install Trivy
sudo apt-get install -y wget
wget https://github.com/aquasecurity/trivy/releases/download/v0.32.1/trivy_0.32.1_Linux-64bit.deb
sudo dpkg -i trivy_0.32.1_Linux-64bit.deb

# Run SonarQube container
sudo docker run -d --name sonar -p 9000:9000 sonarqube:lts-community

# Create startup script
cat << EOF | sudo tee /usr/local/bin/start-services.sh
#!/bin/bash
sudo systemctl start jenkins
sudo docker start sonar
EOF

sudo chmod +x /usr/local/bin/start-services.sh

# Create systemd service for startup script
cat << EOF | sudo tee /etc/systemd/system/start-services.service
[Unit]
Description=Start Jenkins and SonarQube
After=docker.service

[Service]
ExecStart=/usr/local/bin/start-services.sh
Type=oneshot
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable start-services.service
sudo systemctl start start-services.service

# Set up swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

echo "Installation completed. Jenkins is running on port 8080, and SonarQube is running on port 9000."