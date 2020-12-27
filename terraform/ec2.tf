variable "ssh_public_key_path" {
  default = "~/.ssh/contradb-terraform.pub"
}
variable "ssh_private_key_path" {
  default = "~/.ssh/contradb-terraform"
}


data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "server" {
  ami = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  key_name = aws_key_pair.contra_key.key_name
  vpc_security_group_ids = [aws_security_group.allow_ssh.id]
  subnet_id = aws_subnet.web.id

  tags = {
    Name = "contradb"
  }


  user_data = file("ec2-init.sh")

  # delete_on_termination = eventually false, but for now true is aok
}

resource "aws_key_pair" "contra_key" {
  key_name   = "contradb-terraform-key"
  public_key = file(var.ssh_public_key_path)
}

resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow ssh inbound traffic"
  vpc_id = aws_vpc.contra_vpc.id

  ingress {
    description = "ssh"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_ssh"
  }
}

output "ip" {
  value = aws_eip.web_ip.public_ip
}
output "domain" {
  value = aws_eip.web_ip.public_dns
}