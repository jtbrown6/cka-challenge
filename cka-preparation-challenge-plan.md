# 30-Day CKA Preparation Challenge Plan

## Overview
- **Duration**: 30 days
- **Focus**: Hands-on labs to be performed on your homelab Kubernetes cluster
- **Domain Distribution**: Reflects the exam weighting to prioritize areas with higher importance
  - Troubleshooting: 30% (9 days)
  - Cluster Architecture, Installation & Configuration: 25% (8 days)
  - Services & Networking: 20% (6 days)
  - Workloads & Scheduling: 15% (4 days)
  - Storage: 10% (3 days)

Each day includes a specific task or set of tasks aligned with the competencies in the respective domain. The challenges are designed to build skills progressively, starting with foundational tasks and moving to more complex scenarios.

## Weekly Breakdown

### Week 1: Foundation and Cluster Setup
- **Day 1-3: Cluster Architecture, Installation & Configuration (25%)**
  - **Day 1**: Set up a new Kubernetes cluster using kubeadm on your homelab. Focus on preparing the underlying infrastructure and initializing the control plane.
  - **Day 2**: Configure a highly-available control plane with multiple master nodes. Document the steps and test failover.
  - **Day 3**: Implement RBAC policies by creating roles and role bindings for different user scenarios.
- **Day 4-5: Workloads & Scheduling (15%)**
  - **Day 4**: Deploy a simple application and configure pod scheduling using node affinity rules.
  - **Day 5**: Set up resource limits and requests for pods, and test how the scheduler handles resource constraints.
- **Day 6-7: Services & Networking (20%)**
  - **Day 6**: Create different service types (ClusterIP, NodePort, LoadBalancer) and verify connectivity between pods.
  - **Day 7**: Define and apply a Network Policy to restrict traffic between pods in different namespaces.

### Week 2: Storage and Troubleshooting Basics
- **Day 8-9: Storage (10%)**
  - **Day 8**: Implement a Storage Class with dynamic provisioning and create Persistent Volume Claims (PVCs) to test volume allocation.
  - **Day 9**: Configure different volume types and access modes, and test reclaim policies by deleting and recreating PVCs.
- **Day 10-13: Troubleshooting (30%)**
  - **Day 10**: Simulate a node failure in your cluster and troubleshoot the issue to restore functionality.
  - **Day 11**: Investigate a failing cluster component (e.g., kubelet or API server) by analyzing logs and system resources.
  - **Day 12**: Monitor resource usage for an application using built-in Kubernetes tools and identify bottlenecks.
  - **Day 13**: Troubleshoot a misconfigured service by examining container output streams and logs.

### Week 3: Advanced Configuration and Networking
- **Day 14-16: Cluster Architecture, Installation & Configuration (25%)**
  - **Day 14**: Use Helm to install a common application (e.g., Nginx) and customize it with values overrides.
  - **Day 15**: Explore Kustomize for managing cluster configurations and apply a set of resources with patches.
  - **Day 16**: Install a CNI plugin (e.g., Calico or Flannel) and understand its impact on cluster networking.
- **Day 17-19: Services & Networking (20%)**
  - **Day 17**: Set up an Ingress controller and define Ingress resources to manage external traffic to services.
  - **Day 18**: Use the Gateway API to configure advanced traffic routing and test with different workloads.
  - **Day 19**: Configure CoreDNS for custom DNS resolution within the cluster and troubleshoot DNS issues.

### Week 4: Advanced Workloads, Troubleshooting, and Review
- **Day 20-21: Workloads & Scheduling (15%)**
  - **Day 20**: Perform a rolling update on a deployed application and test rollback capabilities.
  - **Day 21**: Configure workload autoscaling using Horizontal Pod Autoscaler (HPA) based on CPU metrics.
- **Day 22-25: Troubleshooting (30%)**
  - **Day 22**: Simulate a networking issue (e.g., pod unable to reach service) and resolve it using diagnostic tools.
  - **Day 23**: Troubleshoot a failing application deployment by analyzing events and pod status.
  - **Day 24**: Create a scenario with high resource contention and optimize cluster performance.
  - **Day 25**: Conduct a full cluster health check, identifying and fixing multiple issues.
- **Day 26-27: Cluster Architecture, Installation & Configuration (25%)**
  - **Day 26**: Implement a Custom Resource Definition (CRD) and deploy an operator to manage custom resources.
  - **Day 27**: Simulate a cluster upgrade using kubeadm and document the process for rollback if needed.
- **Day 28: Storage (10%)**
  - **Day 28**: Manage Persistent Volumes manually, binding them to PVCs, and test data persistence across pod restarts.
- **Day 29-30: Review and Mock Exam**
  - **Day 29**: Review key concepts from all domains and revisit challenging tasks from previous days.
  - **Day 30**: Perform a mock exam scenario by combining tasks from multiple domains (e.g., deploy an app with networking, storage, and RBAC constraints) under a time limit.

## Additional Notes
- **Progress Tracking**: Keep a log of completed tasks, issues encountered, and solutions to build a reference for exam day.
- **Resources**: Use official Kubernetes documentation, kubeadm, Helm, and Kustomize guides as needed for each task.
- **Flexibility**: If a particular domain needs more focus based on your progress, adjust the schedule accordingly.

This plan provides a structured, hands-on approach to mastering the CKA competencies. Use this document as a reference for your daily study routine and adjust as needed based on your progress.
