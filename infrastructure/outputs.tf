output "ec2_public_ip" {
  description = "Point your domain and GitHub secret EC2_HOST to this IP"
  value       = aws_eip.main.public_ip
}

output "rds_endpoint" {
  description = "Use this in DATABASE_URL on the EC2 server"
  value       = aws_db_instance.main.endpoint
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.main.id
}

output "ecr_repository_url" {
  description = "Use this in GitHub Actions to push/pull the Docker image"
  value       = aws_ecr_repository.main.repository_url
}
