TF_IMAGE = hashicorp/terraform:1.9
TF_DIR   = $(shell pwd)

TF = docker run --rm -it \
	-v $(TF_DIR):/workspace \
	-v $(HOME)/.aws:/root/.aws:ro \
	-w /workspace \
	$(TF_IMAGE)

.PHONY: init plan apply destroy output

init:
	$(TF) init

plan:
	$(TF) plan

apply:
	$(TF) apply

destroy:
	$(TF) destroy

output:
	$(TF) output
