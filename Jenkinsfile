pipeline {
agent any
stages{

stage('Deploy'){
steps{
echo 'deploying on another server'
sh '''
ssh student@devopsgeming.online <<EOF
cd ~/smkdev/node-mysmk-be
sudo git pull
cd ~/node-mysmk-be
docker compose up --build -d
'''
     }
    }
  }
}
