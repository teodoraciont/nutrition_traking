data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "main" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.ec2_key_pair_name
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  # Runs once on first boot — installs Docker and nginx
  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ec2-user
  EOF

  tags = { Name = "${var.project_name}-server" }
}

resource "aws_eip" "main" {
  instance = aws_instance.main.id
  domain   = "vpc"
  tags     = { Name = "${var.project_name}-eip" }
}
