resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-users"

  password_policy {
    minimum_length    = 8
    require_uppercase = false
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
  }

  auto_verified_attributes = ["email"]
  tags                     = { Name = "${var.project_name}-user-pool" }
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}
