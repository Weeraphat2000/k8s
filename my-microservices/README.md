# Deploying Microservices with Helm

This guide explains how to deploy your microservices application using [Helm](https://helm.sh/) and [kubectl](https://kubernetes.io/docs/reference/kubectl/). It also covers the concepts of Helm Charts, templates, and values.

---

## Common Helm & kubectl CLI Commands

Here are some useful commands for working with Helm and Kubernetes:

```sh
# Create a new chart structure
helm create <chart-structure>

# Create a new namespace
kubectl create namespace <namespace>

# Install the chart into a namespace (creates namespace if it doesn't exist)
helm install <release-name> . -n <namespace> --create-namespace

# Install or upgrade the chart
helm upgrade <release-name> . --install

# Uninstall the chart
helm uninstall <release-name>

# Uninstall the chart from a specific namespace
helm uninstall <release-name> -n <namespace>

# List all releases in all namespaces
helm list -A

# Show the status of a release
helm status <release-name>

# Show the history of a release
helm history <release-name> -n <namespace>

# Rollback to a previous revision
helm rollback <release-name> <revision> -n <namespace>
```

---

## Example Usage

Below are concrete examples using a release name of `my-microservices` and a namespace of `microservices`:

```sh
# Create a new chart structure
helm create my-microservices

# Create a new namespace
kubectl create namespace microservices

# Install the chart into the namespace (creates namespace if it doesn't exist)
helm install my-microservices . -n microservices --create-namespace

# Install or upgrade the chart
helm upgrade my-microservices . --install

# Uninstall the chart
helm uninstall my-microservices

# Uninstall the chart from a specific namespace
helm uninstall my-microservices -n microservices

# List all releases in all namespaces
helm list -A

# Show the status of a release
helm status my-microservices

# Show the history of a release
helm history my-microservices

# Rollback to revision 1
helm rollback my-microservices 1
```

## Prerequisites

- [Helm CLI](https://helm.sh/docs/intro/install/) installed
- [kubectl CLI](https://kubernetes.io/docs/tasks/tools/) installed and configured to your Kubernetes cluster

---

## Key Concepts

### What is a Helm Chart?

A **Helm Chart** is a collection of files that describe a set of Kubernetes resources. It is a package format for Helm, containing all resource definitions needed to run an application, tool, or service inside a Kubernetes cluster.

### What is a Template?

A **template** in Helm is a Kubernetes manifest file that contains placeholders (using Go templating syntax) for dynamic values. Templates allow you to customize deployments for different environments by substituting values at install/upgrade time.

### What is `values.yaml`?

The **values.yaml** file contains the default configuration values for a Helm Chart. You can override these values using the `--values` or `-f` flag when installing or upgrading a release.

---

## Basic Commands

### 1. Install Dependencies

If your chart depends on other charts, update dependencies:

```sh
helm dependency update
```

### 2. Install the Chart

Install the chart into your Kubernetes cluster:

```sh
helm install <release-name> .
```

- Replace `<release-name>` with your desired release name.
- The `.` refers to the current directory (where your Chart.yaml is located).

### 3. Upgrade the Chart

To apply changes after editing templates or values:

```sh
helm upgrade <release-name> .
```

### 4. Uninstall the Chart

To remove the release from your cluster:

```sh
helm uninstall <release-name>
```

### 5. View Resources

List all resources created by your release:

```sh
kubectl get all -n <namespace>
```

---

## Customizing Deployments

You can override default values in `values.yaml` by providing your own file or setting values inline:

```sh
helm install <release-name> . -f my-values.yaml
```

Or set values directly:

```sh
helm install <release-name> . --set image.tag=latest
```

---

## Directory Structure

- `Chart.yaml`: Metadata about the chart
- `values.yaml`: Default configuration values
- `templates/`: Kubernetes manifest templates

---

## References

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
