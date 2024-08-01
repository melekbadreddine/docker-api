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

# Install Node.js 22.3.0
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs=22.3.0-1nodesource1

# Install Trivy
sudo apt-get install -y wget
wget https://github.com/aquasecurity/trivy/releases/download/v0.32.1/trivy_0.32.1_Linux-64bit.deb
sudo dpkg -i trivy_0.32.1_Linux-64bit.deb

# Install SonarQube
sudo apt-get install -y unzip
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-9.9.1.69595.zip
sudo unzip sonarqube-9.9.1.69595.zip -d /opt
sudo mv /opt/sonarqube-9.9.1.69595 /opt/sonarqube
sudo groupadd sonar
sudo useradd -d /opt/sonarqube -s /bin/bash -g sonar sonar
sudo chown -R sonar:sonar /opt/sonarqube

# Create a systemd service for SonarQube
sudo bash -c 'cat <<EOF > /etc/systemd/system/sonarqube.service
[Unit]
Description=SonarQube service
After=syslog.target network.target

[Service]
Type=forking
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
User=sonar
Group=sonar
Restart=always
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF'

# Enable and start SonarQube
sudo systemctl enable sonarqube
sudo systemctl start sonarqube

# Restart Jenkins to apply all changes
sudo systemctl restart jenkins

echo "Installation completed. Jenkins is running on port 8080, and SonarQube is running on port 9000."
