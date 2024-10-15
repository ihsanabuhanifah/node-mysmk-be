pipeline {
agent any
stages{

stage('Deploy'){
steps{
echo 'deploying on another server'
sh '''
ssh student@devopsgeming.online <<EOF
cd ~/node-mysmk-be/node-mysmk-be
sudo git pull
cd ~/node-mysmk-be
docker compose up --build -d
'''
     }
    }
  }
}
