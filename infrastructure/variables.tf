variable "aws_region" {
  default = "eu-central-1"
}

variable "project_name" {
  default = "nutrition-tracker"
}

variable "db_password" {
  description = "RDS PostgreSQL password"
  sensitive   = true
}

variable "ec2_key_pair_name" {
  description = "Name of the EC2 key pair for SSH access"
}
