# CKA Study Companion Content Mapping

This document serves as a reference for mapping the content from 'daily-helper.md' into the CKA Study Companion App. It organizes the detailed guides for each of the 30 daily challenges, including Challenge Overview, Helpful Hints and Tips, Topics to Explore, Grading Criteria, and Solution sections. This content is intended to be integrated into the app's `index.html` file within the JavaScript data structure `daysData` for display in the daily content viewer.

Below is the structured content for each day, extracted from 'daily-helper.md', formatted to facilitate easy integration into the app.

## Day 1: Cluster Architecture, Installation & Configuration - Set Up a New Kubernetes Cluster
- **Challenge Overview**: Set up a new Kubernetes cluster using kubeadm on your homelab. Focus on preparing the underlying infrastructure and initializing the control plane.
- **Helpful Hints and Tips**:
  - Ensure your nodes meet the minimum requirements for kubeadm, such as disabling swap and installing a container runtime like Docker or containerd.
  - Verify compatibility between Kubernetes versions and your operating system to avoid initialization errors.
  - Use `kubeadm init` with appropriate flags to match your network setup (e.g., `--pod-network-cidr` for CNI compatibility).
  - Save the join command output after initialization to add worker nodes later.
- **Topics to Explore**:
  - Kubernetes architecture basics (control plane vs. worker nodes).
  - Role of kubeadm in cluster bootstrapping.
  - Prerequisites for Kubernetes installation (e.g., networking, system settings).
- **Grading Criteria**:
  - Cluster initialized successfully (check with `kubectl get nodes` showing at least one node).
  - Control plane components are running (verify pod status in `kube-system` namespace with `kubectl get pods -n kube-system`).
  - Worker node(s) can join the cluster without errors (if applicable, check join command execution).
- **Solution**:
  - Install prerequisites on all nodes: disable swap (`swapoff -a`), install container runtime, and kubeadm/kubectl/kubelet packages.
  - On the master node, run `kubeadm init --pod-network-cidr=192.168.0.0/16` (adjust CIDR based on your CNI choice).
  - Set up kubectl configuration: `mkdir -p $HOME/.kube && cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && chown $(id -u):$(id -g) $HOME/.kube/config`.
  - Save the `kubeadm join` command output for worker nodes.
  - Expected output: `kubectl get nodes` shows the master node in 'Ready' state.

## Day 2: Cluster Architecture, Installation & Configuration - Configure Highly-Available Control Plane
- **Challenge Overview**: Configure a highly-available control plane with multiple master nodes. Document the steps and test failover.
- **Helpful Hints and Tips**:
  - Use `kubeadm` to join additional master nodes with the `--control-plane` flag to replicate control plane components.
  - Ensure a load balancer or DNS round-robin is set up to distribute API server requests across master nodes.
  - Test failover by shutting down one master node and verifying cluster operations continue via another master.
  - Keep track of certificates and tokens needed for joining control plane nodes.
- **Topics to Explore**:
  - High availability concepts in Kubernetes.
  - Etcd clustering for data consistency across control plane nodes.
  - Load balancing strategies for API server access.
- **Grading Criteria**:
  - At least two master nodes are part of the control plane (verify with `kubectl get nodes` showing multiple 'control-plane' roles).
  - Control plane components are replicated across masters (check pod distribution in `kube-system` namespace).
  - Failover test passes: shut down one master, and `kubectl` commands still work through another master or load balancer.
- **Solution**:
  - Generate a certificate key for joining control plane nodes: `kubeadm init phase upload-certs --upload-certs` on the first master and save the output key.
  - On additional master nodes, join using: `kubeadm join <first-master-ip>:<port> --token <token> --discovery-token-ca-cert-hash <hash> --control-plane --certificate-key <key>`.
  - Set up a load balancer (e.g., HAProxy) or DNS round-robin pointing to all master node IPs for API server access.
  - Test failover by stopping kubelet on one master (`systemctl stop kubelet`) and running `kubectl get pods` to confirm functionality.
  - Expected output: Multiple nodes with 'control-plane' role in `kubectl get nodes`, and cluster remains operational during failover test.

## Day 3: Cluster Architecture, Installation & Configuration - Implement RBAC Policies
- **Challenge Overview**: Implement Role-Based Access Control (RBAC) policies by creating roles and role bindings for different user scenarios.
- **Helpful Hints and Tips**:
  - Define roles with specific permissions using `Role` or `ClusterRole` resources, focusing on least privilege principles.
  - Use `RoleBinding` or `ClusterRoleBinding` to assign roles to users, groups, or service accounts.
  - Test permissions by impersonating users or using separate kubeconfig files with limited access.
  - Check RBAC policies with `kubectl auth can-i` to verify what a user can do.
- **Topics to Explore**:
  - RBAC components: Roles, ClusterRoles, RoleBindings, and ClusterRoleBindings.
  - Kubernetes authentication and authorization mechanisms.
  - Managing user access in a multi-tenant cluster.
- **Grading Criteria**:
  - At least two distinct roles created with different permission sets (e.g., read-only vs. full namespace access).
  - Role bindings applied correctly to users or service accounts (verify with `kubectl get rolebindings -n <namespace>`).
  - Permissions tested and confirmed (e.g., a read-only user cannot create pods, checked with `kubectl auth can-i create pods --as=<user>`).
- **Solution**:
  - Create a read-only role in a specific namespace: `kubectl create role read-only --verb=get,list,watch --resource=pods,services -n default`.
  - Create a role binding for a user: `kubectl create rolebinding read-only-user --role=read-only --user=test-user -n default`.
  - Create a broader ClusterRole for admin tasks: `kubectl create clusterrole admin-access --verb=* --resource=*`.
  - Bind the ClusterRole to a service account: `kubectl create clusterrolebinding admin-sa --clusterrole=admin-access --serviceaccount=default:admin-sa`.
  - Test permissions: `kubectl auth can-i get pods -n default --as=test-user` should return 'yes', while `kubectl auth can-i create pods -n default --as=test-user` returns 'no'.
  - Expected output: RBAC policies enforced as defined, with users restricted or allowed based on bindings.

## Day 4: Workloads & Scheduling - Deploy Application with Node Affinity
- **Challenge Overview**: Deploy a simple application and configure pod scheduling using node affinity rules.
- **Helpful Hints and Tips**:
  - Use node labels to categorize nodes for scheduling (e.g., `kubectl label nodes <node-name> environment=prod`).
  - Define affinity rules in pod spec under `affinity.nodeAffinity` to match specific node labels.
  - Test scheduling by checking where pods are placed with `kubectl get pods -o wide`.
  - Consider using `requiredDuringSchedulingIgnoredDuringExecution` for strict affinity or `preferredDuringSchedulingIgnoredDuringExecution` for softer preferences.
- **Topics to Explore**:
  - Pod scheduling mechanisms in Kubernetes.
  - Node affinity vs. node selectors.
  - Taints and tolerations interaction with affinity.
- **Grading Criteria**:
  - Node labels applied correctly (verify with `kubectl get nodes --show-labels`).
  - Application deployed with affinity rules in pod spec (check deployment YAML).
  - Pods scheduled on intended nodes based on affinity rules (confirm with `kubectl get pods -o wide`).
- **Solution**:
  - Label a node: `kubectl label nodes <node-name> environment=prod`.
  - Create a deployment with node affinity:
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: affinity-app
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: affinity-app
      template:
        metadata:
          labels:
            app: affinity-app
        spec:
          affinity:
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
                  - key: environment
                    operator: In
                    values:
                    - prod
          containers:
          - name: nginx
            image: nginx
    ```
  - Apply the deployment: `kubectl apply -f affinity-app.yaml`.
  - Expected output: Pods running on nodes labeled `environment=prod` as shown in `kubectl get pods -o wide`.

## Day 5: Workloads & Scheduling - Set Up Resource Limits and Requests
- **Challenge Overview**: Set up resource limits and requests for pods, and test how the scheduler handles resource constraints.
- **Helpful Hints and Tips**:
  - Define `requests` for minimum resources a pod needs and `limits` for maximum resources it can use in the container spec.
  - Monitor resource usage with `kubectl top pod` if metrics-server is installed, or check node capacity with `kubectl describe nodes`.
  - Test scheduler behavior by overcommitting resources on a node and observing pod status (e.g., Pending due to insufficient resources).
  - Use namespaces with resource quotas to enforce limits at a higher level if needed.
- **Topics to Explore**:
  - Resource management in Kubernetes (CPU, memory units).
  - Impact of resource requests and limits on scheduling.
  - Quality of Service (QoS) classes for pods (Guaranteed, Burstable, BestEffort).
- **Grading Criteria**:
  - Deployment created with specific resource requests and limits (verify pod spec with `kubectl describe pod`).
  - Pods scheduled based on available node resources (check pod status and node allocation).
  - Test scenario shows scheduler behavior (e.g., pod in Pending state if resources unavailable, confirmed with `kubectl get pods`).
- **Solution**:
  - Create a deployment with resource constraints:
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: resource-app
    spec:
      replicas: 3
      selector:
        matchLabels:
          app: resource-app
      template:
        metadata:
          labels:
            app: resource-app
        spec:
          containers:
          - name: nginx
            image: nginx
            resources:
              requests:
                cpu: "200m"
                memory: "256Mi"
              limits:
                cpu: "500m"
                memory: "512Mi"
    ```
  - Apply the deployment: `kubectl apply -f resource-app.yaml`.
  - Check pod status: `kubectl get pods` (ensure all are Running if resources are available).
  - Test overcommit by scaling replicas to exceed node capacity: `kubectl scale deployment resource-app --replicas=10` and observe Pending pods.
  - Expected output: Pods with defined resources scheduled appropriately, some in Pending state if node resources are insufficient.

## Day 6: Services & Networking - Create Different Service Types
- **Challenge Overview**: Create different service types (ClusterIP, NodePort, LoadBalancer) and verify connectivity between pods.
- **Helpful Hints and Tips**:
  - Use `ClusterIP` for internal access, `NodePort` for external access on specific ports, and `LoadBalancer` for cloud provider integration (if applicable in homelab).
  - Verify connectivity for ClusterIP with `kubectl exec` to curl from another pod, NodePort by accessing node IP:port externally, and LoadBalancer via its external IP if supported.
  - Check service endpoints with `kubectl get endpoints` to ensure they map to correct pods.
  - Label pods appropriately to match service selectors.
- **Topics to Explore**:
  - Kubernetes service types and their use cases.
  - Service discovery and DNS resolution within the cluster.
  - How services abstract pod IP changes.
- **Grading Criteria**:
  - Three services created: ClusterIP, NodePort, and LoadBalancer (or simulated if not supported in homelab) (verify with `kubectl get svc`).
  - Connectivity confirmed for each service type (e.g., curl from pod for ClusterIP, browser access for NodePort).
  - Endpoints correctly associated with pods (check with `kubectl get endpoints`).
- **Solution**:
  - Deploy a simple app: `kubectl run nginx --image=nginx --replicas=2 --labels=app=nginx-app`.
  - Create ClusterIP service: `kubectl expose deployment nginx --type=ClusterIP --port=80 --target-port=80 --name=nginx-clusterip`.
  - Create NodePort service: `kubectl expose deployment nginx --type=NodePort --port=80 --target-port=80 --name=nginx-nodeport`.
  - Create LoadBalancer service (if supported): `kubectl expose deployment nginx --type=LoadBalancer --port=80 --target-port=80 --name=nginx-lb`.
  - Test ClusterIP: `kubectl exec -it <other-pod> -- curl nginx-clusterip:80` (should return nginx page).
  - Test NodePort: Access `<node-ip>:<nodeport>` in browser (find port with `kubectl get svc nginx-nodeport`).
  - Expected output: All services listed in `kubectl get svc`, with successful connectivity tests for each type.

## Day 7: Services & Networking - Define and Enforce Network Policies
- **Challenge Overview**: Define and apply a Network Policy to restrict traffic between pods in different namespaces.
- **Helpful Hints and Tips**:
  - Ensure your CNI plugin supports Network Policies (e.g., Calico, Cilium); install one if needed.
  - Create namespaces to isolate workloads and apply policies to control ingress/egress traffic.
  - Use `podSelector` and `namespaceSelector` in NetworkPolicy spec to define allowed traffic.
  - Test policy by attempting connections (e.g., curl) from restricted pods and confirming denial.
- **Topics to Explore**:
  - Network Policies and their role in cluster security.
  - CNI plugins supporting Network Policies.
  - Namespace isolation strategies.
- **Grading Criteria**:
  - At least two namespaces created with pods in each (verify with `kubectl get pods -n <namespace>`).
  - Network Policy applied to restrict traffic (check with `kubectl get networkpolicy -n <namespace>`).
  - Traffic restriction confirmed (e.g., curl from pod in one namespace to another fails unless allowed by policy).
- **Solution**:
  - Create namespaces: `kubectl create namespace app1` and `kubectl create namespace app2`.
  - Deploy pods: `kubectl run nginx-app1 --image=nginx -n app1 --labels=app=nginx-app1` and `kubectl run nginx-app2 --image=nginx -n app2 --labels=app=nginx-app2`.
  - Expose services: `kubectl expose pod nginx-app1 --port=80 -n app1` and `kubectl expose pod nginx-app2 --port=80 -n app2`.
  - Create a Network Policy in app1 to allow traffic only from app2:
    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: NetworkPolicy
    metadata:
      name: allow-app2
      namespace: app1
    spec:
      podSelector:
        matchLabels:
          app: nginx-app1
      policyTypes:
      - Ingress
      ingress:
      - from:
        - namespaceSelector:
            matchLabels:
              name: app2
        ports:
        - protocol: TCP
          port: 80
    ```
  - Apply policy: `kubectl apply -f policy.yaml`.
  - Test by curling from app2 to app1 (should work) and from another namespace or pod (should fail).
  - Expected output: Traffic to app1 pods restricted except from app2 namespace as defined.

## Day 8: Storage - Implement Storage Class with Dynamic Provisioning
- **Challenge Overview**: Implement a Storage Class with dynamic provisioning and create Persistent Volume Claims (PVCs) to test volume allocation.
- **Helpful Hints and Tips**:
  - Choose a storage provisioner compatible with your homelab (e.g., local-path-provisioner or NFS if no cloud provider).
  - Define a Storage Class with `provisioner` field pointing to your chosen provisioner.
  - Create a PVC referencing the Storage Class and check if a Persistent Volume (PV) is automatically created.
  - Attach the PVC to a pod and write data to confirm provisioning works.
- **Topics to Explore**:
  - Dynamic provisioning in Kubernetes.
  - Storage Classes and their parameters (e.g., reclaimPolicy).
  - Storage provisioners available for homelab environments.
- **Grading Criteria**:
