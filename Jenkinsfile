pipeline {
agent any
stages{
stage('Checkout'){
steps{
git url: 'https://github.com/ihsanabuhanifah/node-mysmk-be.git', branch: 'main'
 }
}

stage('Build'){
steps{
sh 'sudo docker build . -t rehan26/be-mysmk:latest'
 }
}

stage('Push'){
steps{
sh "sudo docker login -u rehan26 -p dckr_pat_OqA5ij3Deu8kOUlytCHFj_WnH1U"
sh 'sudo docker push rehan26/be-mysmk:latest'
 }
}

stage('Deploy'){
steps{
echo 'deploying on another server'
sh '''
ssh -i /root/.ssh/remotekey student@devopsgeming.online <<EOF
sudo docker login -u rehan26 -p dckr_pat_OqA5ij3Deu8kOUlytCHFj_WnH1U
'''
     }
    }
  }
}
