# Nutrition Tracker — TODO

## Before anything — one-time setup (you do this manually)
- [ ] Create AWS account at aws.amazon.com
- [ ] Install tools on Mac:
      `brew install node terraform awscli && brew install --cask docker`
- [ ] Create a GitHub repo called `nutrition-tracker` and push this folder to it
- [ ] In AWS Console → EC2 → Key Pairs → create a key pair named `nutrition-tracker-key`, download the `.pem` file
- [ ] In AWS Console → S3 → create a bucket named `nutrition-tracker-tf-state` (us-east-1, private)
- [ ] Run `aws configure` in Terminal (enter your AWS Access Key + Secret)
- [ ] Edit `infrastructure/terraform.tfvars` — set a real `db_password`

## Phase 1 — Infrastructure + Skeleton
### Terraform
- [ ] `cd infrastructure && terraform init`
- [ ] `terraform plan` — review what will be created
- [ ] `terraform apply` — create all AWS resources (~10 min)
- [ ] Note the outputs: `ec2_public_ip`, `rds_endpoint`, `ecr_repository_url`, `cognito_user_pool_id`, `cognito_client_id`

### GitHub Actions secrets (after terraform apply)
- [ ] Go to GitHub repo → Settings → Secrets → Actions, add:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `EC2_HOST` (the `ec2_public_ip` from terraform output)
  - `EC2_SSH_KEY` (paste the full contents of your `.pem` file)

### EC2 .env file (SSH in after terraform apply)
- [ ] SSH into EC2: `ssh -i nutrition-tracker-key.pem ec2-user@<ec2_public_ip>`
- [ ] Create `/home/ec2-user/.env` with:
  ```
  DATABASE_URL=postgresql://postgres:<db_password>@<rds_endpoint>/nutrition
  COGNITO_USER_POOL_ID=<from terraform output>
  COGNITO_CLIENT_ID=<from terraform output>
  AWS_REGION=us-east-1
  PORT=3000
  ```

### Backend skeleton
- [x] Write `backend/src/index.js` (Express app, `GET /health`)
- [x] Write `backend/prisma/schema.prisma`
- [x] Write `backend/Dockerfile`
- [x] Write `backend/package.json`
- [ ] Push to `main` → GitHub Actions builds + deploys automatically
- [ ] Verify: `curl http://<ec2_public_ip>:3000/health` returns 200
      (this IP is what the mobile app will use — save it)

### Expo skeleton
- [ ] `cd mobile && npx create-expo-app . --template blank`
- [ ] Install Expo Router + navigation
- [ ] Add placeholder screens + theme constants

## Phase 2 — Authentication
- [ ] `POST /auth/register` route (Cognito + DB User row)
- [ ] `POST /auth/login` route (Cognito initiateAuth → return tokens)
- [ ] `cognitoAuth.js` middleware (JWT verification)
- [ ] Mobile: Login screen
- [ ] Mobile: Register screen
- [ ] Mobile: token stored in SecureStore, redirect logic after login

## Phase 3 — Core CRUD
- [ ] `GET /entries?from=&to=` route
- [ ] `POST /entries` route
- [ ] `PUT /entries/:date` route (upsert)
- [ ] Mobile: Dashboard screen (today kcal, protein, weight, gym toggle, food input)
- [ ] Mobile: History screen (list of days, tap to edit)

## Phase 4 — AI Food Parsing
- [ ] `POST /food/parse` route (Bedrock Claude Sonnet)
- [ ] Mobile: food input triggers parse, pre-fills kcal + protein fields

## Phase 5 — Charts
- [ ] Install Victory Native
- [ ] Mobile: Charts screen — weight trend
- [ ] Mobile: Charts screen — kcal last 14 days
- [ ] Mobile: Charts screen — protein last 14 days
- [ ] Mobile: Charts screen — gym sessions last 7 days
- [ ] Dashboard: 7-day averages for kcal + protein

## Before App Store publishing (do this when ready to publish)
- [ ] Buy a domain (~$12/year .com or ~$1/year .xyz)
- [ ] Add `infrastructure/route53.tf` (A record → Elastic IP)
- [ ] SSH into EC2, install nginx + certbot, get Let's Encrypt cert
- [ ] Update mobile app API base URL from `http://<ip>:3000` to `https://api.yourdomain.com`
- [ ] Remove port 3000 from EC2 security group (traffic goes through nginx on 443)

## Phase 6 — Polish
- [ ] Design tokens applied everywhere (bg #f5f2eb, accent #F5C842, dark #1e1e1e, radius 20)
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error toasts
- [ ] Keyboard avoid + scroll behavior on forms
- [ ] Offline detection
