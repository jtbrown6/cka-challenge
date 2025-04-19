# 30-Day CKA Preparation Challenge Guides

## Introduction
This document provides detailed guides for each of the 30 daily challenges outlined in the CKA Preparation Challenge Plan. Each guide is designed to support your learning and preparation for the Certified Kubernetes Administrator (CKA) exam through hands-on labs on your homelab Kubernetes cluster. The guides include helpful hints, tips, topics to explore, grading criteria to measure your progress, and solutions to compare your outcomes against. To maintain the learning process, solutions are provided at the end of each day's guide, allowing you to attempt the challenge before reviewing the expected outcome.

Use this document as a companion to the 'cka-preparation-challenge-plan.md' to enhance your study routine. Navigate to the relevant day to find guidance for each challenge.

## Daily Guides

### Week 1: Foundation and Cluster Setup

#### Day 1: Cluster Architecture, Installation & Configuration - Set Up a New Kubernetes Cluster
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

#### Day 2: Cluster Architecture, Installation & Configuration - Configure Highly-Available Control Plane
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

#### Day 3: Cluster Architecture, Installation & Configuration - Implement RBAC Policies
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

#### Day 4: Workloads & Scheduling - Deploy Application with Node Affinity
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

#### Day 5: Workloads & Scheduling - Set Up Resource Limits and Requests
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

#### Day 6: Services & Networking - Create Different Service Types
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

#### Day 7: Services & Networking - Define and Enforce Network Policies
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

### Week 2: Storage and Troubleshooting Basics

#### Day 8: Storage - Implement Storage Class with Dynamic Provisioning
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
  - Storage Class created with dynamic provisioning enabled (verify with `kubectl get storageclass`).
  - PVC bound to a dynamically created PV (check with `kubectl get pvc` and `kubectl get pv`).
  - Pod using the PVC can read/write data to the volume (test by writing a file inside the pod).
- **Solution**:
  - Install a provisioner like local-path-provisioner if not using a cloud provider: Follow Rancher’s local-path-provisioner setup guide or use Helm.
  - Create a Storage Class:
    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: local-path
    provisioner: rancher.io/local-path
    volumeBindingMode: WaitForFirstConsumer
    reclaimPolicy: Delete
    ```
  - Create a PVC:
    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: test-pvc
    spec:
      storageClassName: local-path
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
    ```
  - Deploy a pod using the PVC:
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: test-pod
    spec:
      containers:
      - name: busybox
        image: busybox
        command: ["/bin/sh", "-c", "echo 'test' > /data/test.txt && sleep 3600"]
        volumeMounts:
        - name: test-volume
          mountPath: /data
      volumes:
      - name: test-volume
        persistentVolumeClaim:
          claimName: test-pvc
    ```
  - Apply resources: `kubectl apply -f storageclass.yaml`, `kubectl apply -f pvc.yaml`, `kubectl apply -f pod.yaml`.
  - Check binding: `kubectl get pvc` (should show 'Bound').
  - Verify data: `kubectl exec test-pod -- cat /data/test.txt` (should output 'test').
  - Expected output: PVC bound to a dynamically provisioned PV, pod writes data successfully.

#### Day 9: Storage - Configure Volume Types and Access Modes
- **Challenge Overview**: Configure different volume types and access modes, and test reclaim policies by deleting and recreating PVCs.
- **Helpful Hints and Tips**:
  - Experiment with volume types like `emptyDir` (ephemeral), `hostPath` (node-specific), and persistent volumes via PVCs.
  - Set access modes in PVCs: `ReadWriteOnce` (single node), `ReadOnlyMany` (multiple readers), `ReadWriteMany` (if supported by storage).
  - Test reclaim policies (`Delete` vs. `Recycle`) by deleting PVCs and observing PV behavior.
  - Use `kubectl describe pvc` and `kubectl describe pv` to debug binding issues.
- **Topics to Explore**:
  - Kubernetes volume types and their use cases.
  - Access modes and storage compatibility.
  - Reclaim policies and data lifecycle management.
- **Grading Criteria**:
  - At least two different volume types configured (e.g., hostPath and PVC) (verify pod specs).
  - PVCs created with different access modes (check with `kubectl describe pvc`).
  - Reclaim policy behavior confirmed (e.g., PV deleted or retained after PVC deletion, check with `kubectl get pv`).
- **Solution**:
  - Create a pod with `hostPath` volume (ReadWriteOnce implied):
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: hostpath-pod
    spec:
      containers:
      - name: busybox
        image: busybox
        command: ["/bin/sh", "-c", "sleep 3600"]
        volumeMounts:
        - name: host-data
          mountPath: /data
      volumes:
      - name: host-data
        hostPath:
          path: /tmp/data
          type: DirectoryOrCreate
    ```
  - Create a PVC with `ReadWriteMany` (if supported) using a Storage Class:
    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: rwm-pvc
    spec:
      storageClassName: local-path
      accessModes:
        - ReadWriteMany
      resources:
        requests:
          storage: 1Gi
    ```
  - Deploy multiple pods using the same PVC to test ReadWriteMany.
  - Set Storage Class reclaimPolicy to `Delete`, delete PVC, and confirm PV is removed: `kubectl delete pvc rwm-pvc` then `kubectl get pv`.
  - Expected output: Pods using different volume types run successfully, access modes respected (e.g., multiple pods can mount ReadWriteMany PVC), reclaim policy behavior as configured.

#### Day 10: Troubleshooting - Simulate Node Failure
- **Challenge Overview**: Simulate a node failure in your cluster and troubleshoot the issue to restore functionality.
- **Helpful Hints and Tips**:
  - Simulate failure by stopping kubelet on a node (`systemctl stop kubelet`) or shutting down the node VM if in a homelab.
  - Check cluster status with `kubectl get nodes` to identify NotReady nodes.
  - Inspect logs on the failed node (`journalctl -u kubelet`) for errors after restarting.
  - Verify pod rescheduling on other nodes if the failed node was hosting workloads.
- **Topics to Explore**:
  - Node status and health monitoring in Kubernetes.
  - Pod eviction and rescheduling behavior.
  - Kubelet troubleshooting techniques.
- **Grading Criteria**:
  - Node failure simulated and detected (NotReady status in `kubectl get nodes`).
  - Pods rescheduled to healthy nodes if applicable (check with `kubectl get pods -o wide`).
  - Node restored to Ready state after troubleshooting (confirm with `kubectl get nodes`).
- **Solution**:
  - On a worker node, stop kubelet: `systemctl stop kubelet`.
  - Check cluster: `kubectl get nodes` (node shows NotReady after a few minutes).
  - Observe pod behavior: `kubectl get pods -o wide` (pods on failed node should be rescheduled if no affinity rules prevent it).
  - Check logs on failed node: `journalctl -u kubelet` (look for errors like network issues or certificate problems).
  - Restart kubelet: `systemctl start kubelet` and monitor status: `kubectl get nodes` (should return to Ready).
  - Expected output: Node transitions from Ready to NotReady and back to Ready after resolution, pods rescheduled as needed.

#### Day 11: Troubleshooting - Investigate Failing Cluster Component
- **Challenge Overview**: Investigate a failing cluster component (e.g., kubelet or API server) by analyzing logs and system resources.
- **Helpful Hints and Tips**:
  - Identify failing component by checking pod status in `kube-system` namespace (`kubectl get pods -n kube-system`).
  - Access logs for control plane components via `kubectl logs` or directly on nodes (`journalctl -u kube-apiserver` if static pods).
  - Check system resources (CPU, memory, disk) on the node hosting the component using `top` or `df` to rule out resource exhaustion.
  - Look for error messages related to networking, certificates, or configuration in logs.
- **Topics to Explore**:
  - Kubernetes control plane architecture and components.
  - Log aggregation and analysis in Kubernetes.
  - Common failure modes for API server, controller manager, and scheduler.
- **Grading Criteria**:
  - Failing component identified (e.g., crashing pod in `kube-system`, verified with `kubectl get pods -n kube-system`).
  - Logs analyzed and potential cause identified (document findings from `kubectl logs` or system logs).
  - Issue resolved or mitigated (e.g., restart component, fix config, confirm component stability with status check).
- **Solution**:
  - Check control plane health: `kubectl get pods -n kube-system` (look for CrashLoopBackOff or Error states).
  - Simulate issue if needed by misconfiguring API server (e.g., edit static pod manifest with invalid flag on master node at `/etc/kubernetes/manifests/kube-apiserver.yaml`, then restart kubelet).
  - Get logs: `kubectl logs kube-apiserver-<node> -n kube-system` or `journalctl -u kube-apiserver` on master node.
  - Identify error (e.g., invalid flag or port conflict), correct manifest, and restart: `systemctl restart kubelet`.
  - Confirm resolution: `kubectl get pods -n kube-system` (API server pod Running).
  - Expected output: Failing component identified, logs show error (e.g., configuration issue), resolution restores component to healthy state.

#### Day 12: Troubleshooting - Monitor Resource Usage
- **Challenge Overview**: Monitor resource usage for an application using built-in Kubernetes tools and identify bottlenecks.
- **Helpful Hints and Tips**:
  - Install metrics-server if not already present to enable `kubectl top` for resource usage data.
  - Use `kubectl describe nodes` to see overall node resource allocation and limits.
  - Check pod resource usage with `kubectl top pod` or container logs for high CPU/memory indicators.
  - Identify bottlenecks by correlating high usage with application performance issues (e.g., slow response times).
- **Topics to Explore**:
  - Kubernetes metrics and monitoring ecosystem.
  - Metrics-server installation and usage.
  - Resource contention and its impact on workloads.
- **Grading Criteria**:
  - Resource monitoring tool set up (e.g., metrics-server installed, verified with `kubectl get pods -n kube-system`).
  - Application resource usage data collected (check output of `kubectl top pod` or similar).
  - Bottleneck identified (e.g., pod exceeding CPU limit, documented with usage stats and observed impact).
- **Solution**:
  - Install metrics-server: Use Helm (`helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/` and `helm install metrics-server metrics-server/metrics-server -n kube-system`) or manifest from GitHub.
  - Deploy a resource-intensive app if needed:
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: stress-test
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: stress-test
      template:
        metadata:
          labels:
            app: stress-test
        spec:
          containers:
          - name: stress
            image: polinux/stress
            command: ["stress", "--cpu", "2", "--vm", "1"]
            resources:
              limits:
                cpu: "500m"
                memory: "512Mi"
    ```
  - Monitor usage: `kubectl top pod` (shows high CPU/memory for stress-test pod).
  - Check node: `kubectl describe nodes` (see if node is near capacity).
  - Identify bottleneck: Pod may be throttled due to CPU limit, causing performance issues.

#### Day 13: Troubleshooting - Troubleshoot Misconfigured Service
- **Challenge Overview**: Troubleshoot a misconfigured service by examining container output streams and logs.
- **Helpful Hints and Tips**:
  - Start by checking the service status and associated pods with `kubectl get svc` and `kubectl get pods` to identify any immediate anomalies.
  - Use `kubectl describe svc <service-name>` to inspect service details like selectors and endpoints, ensuring they match the intended pods.
  - Analyze logs with `kubectl logs <pod-name>` to look for errors related to connectivity or configuration.
  - Verify endpoint mappings with `kubectl get endpoints <service-name>` to ensure the service is correctly linked to pods.
- **Topics to Explore**:
  - Service configuration and endpoint management in Kubernetes.
  - Log analysis for diagnosing service issues.
  - Common service misconfiguration patterns (e.g., selector mismatches, port errors).
- **Grading Criteria**:
  - Service issue identified (e.g., no endpoints or incorrect pod selection, verified with `kubectl describe svc`).
  - Logs inspected to pinpoint error messages (document findings from `kubectl logs`).
  - Issue resolved by correcting configuration (e.g., update selector, confirm with `kubectl get endpoints` showing active endpoints).
- **Solution**:
  - Check service status: `kubectl get svc` (look for services with no endpoints or unusual status).
  - Describe service: `kubectl describe svc <service-name>` (note if selectors don't match pod labels or ports are incorrect).
  - Inspect pod labels: `kubectl get pods --show-labels` (compare with service selector).
  - Example scenario 1 - Selector mismatch: If service selector is `app=frontend` but pods are labeled `app=front-end`, update service YAML or pod labels to match: `kubectl label pod <pod-name> app=frontend --overwrite`.
  - Example scenario 2 - Port mismatch: If service targets port 8080 but pod exposes 80, edit service: `kubectl edit svc <service-name>` to correct `targetPort`.
  - Check logs for errors: `kubectl logs <pod-name>` (look for connection refused or binding issues).
  - Verify endpoints post-fix: `kubectl get endpoints <service-name>` (should list pod IPs).
  - Expected output: Service connects to pods after correction, endpoints populated, and access (e.g., `curl <service-name>:<port>`) succeeds from another pod.

### Week 3: Advanced Configuration and Networking

#### Day 14: Cluster Architecture, Installation & Configuration - Use Helm for Application Installation
- **Challenge Overview**: Use Helm to install a common application (e.g., Nginx) and customize it with values overrides.
- **Helpful Hints and Tips**:
  - Install Helm on your system if not already present, following official documentation for your OS.
  - Add a Helm repository like Bitnami for common charts: `helm repo add bitnami https://charts.bitnami.com/bitnami`.
  - Use `helm install` with custom values via `--set` or a values YAML file to tailor the application to your needs.
  - Verify installation with `kubectl get pods` and `helm list` to ensure the release is active.
- **Topics to Explore**:
  - Helm chart structure and customization options.
  - Managing application dependencies with Helm.
  - Troubleshooting Helm installation failures.
- **Grading Criteria**:
  - Helm installed and repository added (verify with `helm repo list`).
  - Application deployed via Helm with custom configurations (check with `helm list` and `kubectl get pods`).
  - Customization confirmed (e.g., Nginx welcome page altered, verified by accessing the service).
- **Solution**:
  - Install Helm if needed (follow official guide for your OS, e.g., `curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash` on Linux).
  - Add Bitnami repo: `helm repo add bitnami https://charts.bitnami.com/bitnami`.
  - Install Nginx with custom server block: `helm install my-nginx bitnami/nginx --set serverBlock="server { listen 80; server_name example.com; location / { return 200 'Custom Welcome!'; add_header Content-Type text/plain; } }"` in a namespace: `--namespace default`.
  - Check deployment: `kubectl get pods -n default` (pods should be Running).
  - Access service: Find service name with `kubectl get svc -n default` and test with `curl <service-name>:80` from another pod or external if exposed.
  - Expected output: Helm release listed in `helm list`, Nginx pods running, custom message returned on access.

#### Day 15: Cluster Architecture, Installation & Configuration - Explore Kustomize for Configurations
- **Challenge Overview**: Use Kustomize to manage cluster configurations and apply a set of resources with patches.
- **Helpful Hints and Tips**:
  - Kustomize is built into `kubectl` (since v1.14), so no separate installation is needed; use `kubectl apply -k`.
  - Create a `kustomization.yaml` file to define base resources and patches for customization.
  - Organize resources in directories (base and overlays) to manage different environments or configurations.
  - Preview changes with `kubectl kustomize <directory>` before applying to ensure correctness.
- **Topics to Explore**:
  - Kustomize concepts: bases, overlays, and patches.
  - Comparison of Kustomize with Helm for configuration management.
  - Managing multi-environment setups with Kustomize.
- **Grading Criteria**:
  - Kustomization file created with base and patch definitions (verify content of `kustomization.yaml`).
  - Resources applied successfully using Kustomize (check with `kubectl get pods` or relevant resource type).
  - Customizations from patches applied (e.g., modified labels or configs, confirmed with `kubectl describe`).
- **Solution**:
  - Create a directory structure: `mkdir -p kustomize/base kustomize/overlays/dev`.
  - In `kustomize/base`, create a deployment YAML (e.g., for Nginx) and a `kustomization.yaml`:
    ```yaml
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization
    resources:
    - deployment.yaml
    ```
  - In `kustomize/overlays/dev`, create a patch file `patch.yaml` to modify replicas or labels:
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nginx-deployment
    spec:
      replicas: 2
      template:
        metadata:
          labels:
            env: dev
    ```
  - Add `kustomization.yaml` in overlay:
    ```yaml
    apiVersion: kustomize.config.k8s.io/v1beta1
    kind: Kustomization
    resources:
    - ../../base
    patchesStrategicMerge:
    - patch.yaml
    ```
  - Apply: `kubectl apply -k kustomize/overlays/dev`.
  - Verify: `kubectl get pods` (should show 2 replicas with label `env=dev`).
  - Expected output: Resources deployed with customizations from Kustomize patches as defined.

#### Day 16: Cluster Architecture, Installation & Configuration - Install CNI Plugin
- **Challenge Overview**: Install a CNI plugin (e.g., Calico or Flannel) and understand its impact on cluster networking.
- **Helpful Hints and Tips**:
  - Choose a CNI plugin based on your cluster needs (e.g., Flannel for simplicity, Calico for Network Policies).
  - If reinstalling, reset the cluster networking with `kubeadm reset` on nodes (backup data first) or delete existing CNI pods.
  - Apply CNI manifests from official sources using `kubectl apply -f <url>` after cluster initialization.
  - Verify networking by creating pods in different namespaces and testing connectivity with `kubectl exec` and `ping`.
- **Topics to Explore**:
  - Role of CNI in Kubernetes networking.
  - Differences between CNI plugins (e.g., overlay vs. routed networks).
  - Impact of CNI on Network Policy enforcement.
- **Grading Criteria**:
  - CNI plugin installed (verify pods in `kube-system` namespace with `kubectl get pods -n kube-system`).
  - Pod-to-pod connectivity tested across nodes (confirm with `kubectl exec` and basic network checks).
  - Basic understanding of CNI impact (e.g., Network Policy support if using Calico, documented in logs).
- **Solution**:
  - Choose Calico for this example (supports Network Policies). If cluster already has a CNI, consider resetting networking or using a fresh cluster.
  - Apply Calico manifest post `kubeadm init`: `kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml`.
  - Check installation: `kubectl get pods -n kube-system` (look for Calico pods like `calico-node` and `calico-kube-controllers` in Running state).
  - Deploy test pods on different nodes: `kubectl run test1 --image=busybox -n default -- /bin/sh -c "sleep 3600"` and repeat for `test2`.
  - Test connectivity: `kubectl exec test1 -n default -- ping <test2-pod-ip>` (find IP with `kubectl get pods -o wide`).
  - Expected output: Calico pods running, pod-to-pod communication successful across nodes, confirming CNI functionality.

#### Day 17: Services & Networking - Set Up Ingress Controller and Resources
- **Challenge Overview**: Set up an Ingress controller and define Ingress resources to manage external traffic to services.
- **Helpful Hints and Tips**:
  - Choose an Ingress controller suitable for homelab (e.g., Nginx Ingress Controller) and install it via Helm or manifests.
  - Ensure your cluster has a working CNI for pod networking before setting up Ingress.
  - Define Ingress resources with rules for path or host-based routing to backend services.
  - Test Ingress by accessing defined hosts/paths externally or via `curl` with custom headers if no DNS setup.
- **Topics to Explore**:
  - Ingress vs. LoadBalancer/NodePort for external access.
  - Ingress controller options and configurations.
  - TLS setup for Ingress resources.
- **Grading Criteria**:
  - Ingress controller installed (verify with `kubectl get pods -n <controller-namespace>`).
  - Ingress resource defined and applied (check with `kubectl get ingress`).
  - Traffic routing confirmed (e.g., access path or host routes to correct service, tested with `curl` or browser).
- **Solution**:
  - Install Nginx Ingress Controller via Helm: `helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx` and `helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace`.
  - Verify controller: `kubectl get pods -n ingress-nginx` (should show controller pod Running).
  - Deploy two test services (e.g., Nginx and a simple HTTP server):
    - `kubectl run nginx --image=nginx --port=80 --labels=app=nginx-app`.
    - `kubectl expose pod nginx --port=80 --name=nginx-svc`.
    - Repeat for another app if needed.
  - Create Ingress resource:
    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: test-ingress
      annotations:
        nginx.ingress.kubernetes.io/rewrite-target: /
    spec:
      rules:
      - host: example.local
        http:
          paths:
          - path: /nginx
            pathType: Prefix
            backend:
              service:
                name: nginx-svc
                port:
                  number: 80
    ```
  - Apply: `kubectl apply -f ingress.yaml`.
  - Test (if no DNS, edit /etc/hosts to map `example.local` to controller external IP or use curl): `curl -H "Host: example.local" http://<controller-ip>/nginx`.
  - Expected output: Ingress routes traffic to Nginx service when accessing `/nginx` path under specified host.

#### Day 18: Services & Networking - Use Gateway API for Traffic Routing
- **Challenge Overview**: Use the Gateway API to configure advanced traffic routing and test with different workloads.
- **Helpful Hints and Tips**:
  - Gateway API is an evolution of Ingress, requiring specific controller implementations (e.g., Istio, Contour); check if supported in your homelab setup.
  - Install a Gateway controller if needed, following project-specific guides (e.g., Contour via Helm).
  - Define `Gateway` and `HTTPRoute` resources to manage traffic routing with more granularity than Ingress.
  - Test routing rules by deploying multiple services and accessing defined paths or hosts.
- **Topics to Explore**:
  - Gateway API vs. Ingress API for traffic management.
  - Components of Gateway API: Gateway, HTTPRoute, TCPRoute, etc.
  - Advanced routing features (e.g., traffic splitting, header matching).
- **Grading Criteria**:
  - Gateway controller installed if required (verify with `kubectl get pods -n <controller-namespace>`).
  - Gateway and HTTPRoute resources defined (check with `kubectl get gateway` and `kubectl get httproute` if supported).
  - Traffic routing tested and confirmed (e.g., specific paths route to correct services, verified with access tests).
- **Solution**:
  - Install Contour as Gateway API controller: `helm repo add bitnami https://charts.bitnami.com/bitnami` and `helm install contour bitnami/contour -n projectcontour --create-namespace --set envoy.service.type=NodePort`.
  - Verify: `kubectl get pods -n projectcontour` (Contour and Envoy pods Running).
  - Deploy test services (e.g., two Nginx instances with different labels).
  - Define Gateway:
    ```yaml
    apiVersion: gateway.networking.k8s.io/v1beta1
    kind: Gateway
    metadata:
      name: test-gateway
      namespace: default
    spec:
      gatewayClassName: contour
      listeners:
      - name: http
        port: 80
        protocol: HTTP
    ```
  - Define HTTPRoute for routing:
    ```yaml
    apiVersion: gateway.networking.k8s.io/v1beta1
    kind: HTTPRoute
    metadata:
      name: test-route
      namespace: default
    spec:
      parentRefs:
      - name: test-gateway
      hostnames:
      - "test.local"
      rules:
      - matches:
        - path:
            type: PathPrefix
            value: /app1
        backendRefs:
        - name: app1-svc
          port: 80
    ```
  - Apply: `kubectl apply -f gateway.yaml` and `kubectl apply -f route.yaml`.
  - Test routing: Access `<envoy-nodeport-ip>/app1` with host header or mapped DNS.
  - Expected output: Traffic routed to `app1-svc` when accessing `/app1` under specified hostname.

#### Day 19: Services & Networking - Configure CoreDNS for Custom Resolution
- **Challenge Overview**: Configure CoreDNS for custom DNS resolution within the cluster and troubleshoot DNS issues.
- **Helpful Hints and Tips**:
  - CoreDNS is the default DNS server in Kubernetes (since v1.12); locate its ConfigMap in `kube-system` namespace with `kubectl get configmap -n kube-system`.
  - Edit CoreDNS ConfigMap to add custom zones or forwarders for specific domains using `kubectl edit configmap coredns -n kube-system`.
  - Test DNS resolution from pods using `kubectl exec <pod> -- nslookup <domain>` or `dig`.
  - Restart CoreDNS pods after changes with `kubectl delete pod -l k8s-app=coredns -n kube-system` to apply configurations.
- **Topics to Explore**:
  - CoreDNS architecture and plugin system.
  - DNS resolution flow in Kubernetes.
  - Common DNS issues and debugging techniques.
- **Grading Criteria**:
  - CoreDNS configuration modified for custom resolution (verify ConfigMap changes with `kubectl describe configmap coredns -n kube-system`).
  - Custom DNS resolution tested from a pod (confirm with `nslookup` or similar command output).
  - DNS troubleshooting performed if issues arise (e.g., check CoreDNS logs with `kubectl logs`).
- **Solution**:
  - Check CoreDNS ConfigMap: `kubectl get configmap coredns -n kube-system -o yaml`.
  - Edit to add a custom forward for a domain (e.g., forward `example.local` to a specific DNS server):
    - `kubectl edit configmap coredns -n kube-system`
    - Add under `data.Corefile`:
      ```
      example.local:53 {
          forward . 8.8.8.8
      }
      ```
  - Restart CoreDNS: `kubectl delete pod -l k8s-app=coredns -n kube-system`.
  - Deploy a test pod: `kubectl run busybox --image=busybox -- /bin/sh -c "sleep 3600"`.
  - Test resolution: `kubectl exec busybox -- nslookup example.local` (should resolve via forwarded DNS).
  - If resolution fails, check CoreDNS logs: `kubectl logs -l k8s-app=coredns -n kube-system` (look for syntax errors or forwarder issues).
  - Expected output: Custom DNS resolution works as configured, or logs indicate specific errors to fix.

### Week 4: Advanced Workloads, Troubleshooting, and Review

#### Day 20: Workloads & Scheduling - Perform Rolling Updates and Rollbacks
- **Challenge Overview**: Perform a rolling update on a deployed application and test rollback capabilities.
- **Helpful Hints and Tips**:
  - Use `kubectl set image` or edit Deployment YAML to trigger a rolling update with a new image version.
  - Monitor update progress with `kubectl rollout status deployment/<name>` to ensure zero downtime.
  - Test rollback with `kubectl rollout undo deployment/<name>` if the update introduces issues.
  - Configure `replicas`, `minReadySeconds`, and `revisionHistoryLimit` in Deployment spec to control update behavior.
- **Topics to Explore**:
  - Rolling update strategy in Kubernetes Deployments.
  - Rollback mechanisms and revision history.
  - Ensuring zero downtime during updates.
- **Grading Criteria**:
  - Rolling update performed on a Deployment (verify with `kubectl rollout status` showing completion).
  - Application accessibility maintained during update (test with service access or `curl`).
  - Rollback tested successfully if needed (confirm with `kubectl rollout history` and application behavior).
- **Solution**:
  - Deploy a sample app: `kubectl create deployment nginx-app --image=nginx:1.14 --replicas=3`.
  - Expose it: `kubectl expose deployment nginx-app --port=80 --name=nginx-app-svc`.
  - Trigger rolling update: `kubectl set image deployment/nginx-app nginx=nginx:1.16 --record`.
  - Monitor: `kubectl rollout status deployment/nginx-app` (should show update progress).
  - Test access during update: `kubectl exec -it <other-pod> -- curl nginx-app-svc:80` (should respond without interruption).
  - If update fails or for testing, rollback: `kubectl rollout undo deployment/nginx-app`.
  - Check history: `kubectl rollout history deployment/nginx-app` (shows revisions).
  - Expected output: Update completes with new image, no downtime observed, rollback restores previous version if executed.

#### Day 21: Workloads & Scheduling - Configure Workload Autoscaling
- **Challenge Overview**: Configure workload autoscaling using Horizontal Pod Autoscaler (HPA) based on CPU metrics.
- **Helpful Hints and Tips**:
  - Ensure metrics-server is installed for resource metrics: `kubectl get pods -n kube-system` (look for metrics-server).
  - Define HPA with `kubectl autoscale` or YAML, setting target CPU utilization and min/max replicas.
  - Simulate load to test scaling with a stress tool or manual requests to trigger CPU usage.
  - Monitor scaling with `kubectl get hpa` and `kubectl get pods` to observe replica changes.
- **Topics to Explore**:
  - Horizontal Pod Autoscaler mechanics and metrics.
  - Custom metrics for autoscaling (beyond CPU/memory).
  - Interaction of HPA with resource limits and requests.
- **Grading Criteria**:
  - HPA resource created for a Deployment (verify with `kubectl get hpa`).
  - Scaling triggered under load (confirm replica count changes with `kubectl get pods`).
  - Scaling behavior aligns with defined thresholds (check CPU usage with `kubectl top pod` if available, or pod count).
- **Solution**:
  - Ensure metrics-server is running (install if needed as per Day 12 solution).
  - Deploy a test app with resource limits: 
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: autoscale-app
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: autoscale-app
      template:
        metadata:
          labels:
            app: autoscale-app
        spec:
          containers:
          - name: php-apache
            image: hpa-example
            resources:
              limits:
                cpu: "500m"
              requests:
                cpu: "200m"
    ```
  - Apply and expose: `kubectl apply -f autoscale-app.yaml` and `kubectl expose deployment autoscale-app --port=80 --name=autoscale-svc`.
  - Create HPA: `kubectl autoscale deployment autoscale-app --cpu-percent=50 --min=1 --max=5`.
  - Simulate load (if no load generator, use a loop in another pod): `kubectl run -it --rm load-generator --image=busybox -- /bin/sh -c "while true; do wget -q -O- http://autoscale-svc:80; done"`.
  - Monitor: `kubectl get hpa autoscale-app -w` (watch replicas scale up on load).
  - Expected output: HPA scales pods up to 5 under load (CPU > 50%), scales down when load decreases.

#### Day 22: Troubleshooting - Simulate Networking Issue
- **Challenge Overview**: Simulate a networking issue (e.g., pod unable to reach service) and resolve it using diagnostic tools.
- **Helpful Hints and Tips**:
  - Simulate issues by misconfiguring a service, Network Policy, or stopping network components.
  - Check pod network status with `kubectl get pods -o wide` to see IPs and nodes.
  - Use `kubectl exec <pod> -- ping <target-ip>` or `curl <service>` to test connectivity from within pods.
  - Inspect Network Policies with `kubectl get networkpolicy -n <namespace>` if traffic is unexpectedly blocked.
- **Topics to Explore**:
  - Kubernetes networking model and troubleshooting flow.
  - Common networking issues (DNS, CNI failures, policy restrictions).
  - Diagnostic commands within pod environments.
- **Grading Criteria**:
  - Networking issue simulated and identified (e.g., pod can't reach service, verified with failed connectivity test).
  - Diagnostic steps performed to isolate cause (document findings from `kubectl describe` or logs).
  - Issue resolved (e.g., correct policy or service config, confirmed with successful connectivity).
- **Solution**:
  - Deploy two pods and a service: `kubectl run app1 --image=nginx -l app=app1`, `kubectl expose pod app1 --port=80 --name=app1-svc`, and `kubectl run app2 --image=busybox -- /bin/sh -c "sleep 3600" -l app=app2`.
  - Simulate issue - Apply a restrictive Network Policy in the namespace to block app2 from app1-svc:
    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: NetworkPolicy
    metadata:
      name: block-app2
      namespace: default
    spec:
      podSelector:
        matchLabels:
          app: app1
      policyTypes:
      - Ingress
      ingress:
      - from:
        - podSelector:
            matchLabels:
              app: app1
    ```
  - Apply: `kubectl apply -f block-policy.yaml`.
  - Test from app2: `kubectl exec app2 -- curl app1-svc:80` (should fail).
  - Diagnose: Check policy with `kubectl get networkpolicy`, describe service `kubectl describe svc app1-svc` (endpoints ok?), check pod IPs `kubectl get pods -o wide`.
  - Example scenario 1 - Policy issue: Realize policy blocks app2; edit policy to allow app2 or delete: `kubectl delete networkpolicy block-app2`.
  - Example scenario 2 - DNS issue: If `curl` by IP works but service name fails, check DNS with `kubectl exec app2 -- nslookup app1-svc` (points to CoreDNS issue or service name mismatch).
  - Retest: `kubectl exec app2 -- curl app1-svc:80` (should succeed post-fix).
  - Expected output: Connectivity restored after identifying and resolving network restriction or configuration error.

#### Day 23: Troubleshooting - Troubleshoot Failing Application Deployment
- **Challenge Overview**: Troubleshoot a failing application deployment by analyzing events and pod status.
- **Helpful Hints and Tips**:
  - Check deployment status with `kubectl get deployment` for replica mismatches or failures.
  - Use `kubectl describe deployment <name>` to see events and conditions indicating failure reasons.
  - Inspect pod status with `kubectl get pods` and `kubectl describe pod <name>` for container-specific errors.
  - Look at events with `kubectl get events --sort-by=.metadata.creationTimestamp` for chronological failure clues.
- **Topics to Explore**:
  - Deployment failure modes (image pull errors, resource issues, config errors).
  - Event logging in Kubernetes for diagnostics.
  - Pod lifecycle and status conditions.
- **Grading Criteria**:
  - Failing deployment identified (e.g., pods not ready, verified with `kubectl get deployment`).
  - Cause of failure determined (document findings from `kubectl describe` or events).
  - Issue resolved and deployment successful (confirm with `kubectl get pods` showing Running state).
- **Solution**:
  - Create a failing deployment (e.g., wrong image tag):
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: fail-app
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: fail-app
      template:
        metadata:
          labels:
            app: fail-app
        spec:
          containers:
          - name: nginx
            image: nginx:nonexistent-tag
    ```
  - Apply: `kubectl apply -f fail-app.yaml`.
  - Check status: `kubectl get deployment fail-app` (shows 0/2 ready).
  - Diagnose: `kubectl describe deployment fail-app` (may show image pull error in events).
  - Check pods: `kubectl get pods -l app=fail-app` (pods in ImagePullBackOff or ErrImagePull).
  - View events: `kubectl get events --sort-by=.metadata.creationTimestamp | grep fail-app` (confirms image pull failure).
  - Example scenario 1 - Image issue: Fix by updating image to valid tag `kubectl set image deployment/fail-app nginx=nginx:1.14`.
  - Example scenario 2 - Resource issue: If failure due to insufficient CPU/memory, check `kubectl describe pod` for OOMKilled or Pending status, then adjust resources in YAML.
  - Example scenario 3 - ConfigMap/Secret missing: If app fails to start due to missing config, check logs `kubectl logs <pod>` and create missing resource.
  - Verify fix: `kubectl get pods -l app=fail-app` (should be Running).
  - Expected output: Deployment failure root cause identified (e.g., bad image), corrected, and pods reach Running state.

#### Day 24: Troubleshooting - Optimize Cluster Performance Under Contention
- **Challenge Overview**: Create a scenario with high resource contention and optimize cluster performance.
- **Helpful Hints and Tips**:
  - Simulate contention by deploying workloads with high resource requests exceeding node capacity.
  - Check node resources with `kubectl describe nodes` to see CPU/memory allocation and pressure.
  - Identify throttled or evicted pods with `kubectl get pods` (look for Pending or Terminated states) and `kubectl describe pod` for reasons.
  - Optimize by adjusting resource requests/limits, adding taints/tolerations, or scaling nodes if possible in homelab.
- **Topics to Explore**:
  - Resource contention effects on pod scheduling and performance.
  - Pod Quality of Service (QoS) classes and eviction policies.
  - Node pressure and kubelet behavior under stress.
- **Grading Criteria**:
  - Resource contention scenario created (e.g., overcommitted CPU/memory, verified with `kubectl describe nodes`).
  - Performance issues identified (e.g., pods Pending or throttled, documented with status and events).
  - Optimization applied and improvement observed (e.g., pods scheduled after adjustment, confirmed with `kubectl get pods`).
- **Solution**:
  - Deploy multiple resource-heavy pods to create contention:
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: stress-contention
    spec:
      replicas: 5
      selector:
        matchLabels:
          app: stress-contention
      template:
        metadata:
          labels:
            app: stress-contention
        spec:
          containers:
          - name: stress
            image: polinux/stress
            command: ["stress", "--cpu", "2", "--vm", "1"]
            resources:
              requests:
                cpu: "1000m"
                memory: "1Gi"
              limits:
                cpu: "1500m"
                memory: "1.5Gi"
    ```
  - Apply: `kubectl apply -f stress-contention.yaml`.
  - Check node status: `kubectl describe nodes` (look for high CPU/memory allocation, possible pressure).
  - Observe pods: `kubectl get pods -l app=stress-contention` (some may be Pending if resources insufficient).
  - Diagnose: `kubectl describe pod <pending-pod>` (may show "Insufficient cpu" or similar).
  - Example scenario 1 - Overcommitment: Reduce requests/limits in Deployment YAML to fit node capacity: `kubectl edit deployment stress-contention` (e.g., lower CPU request to 500m).
  - Example scenario 2 - Eviction: If pods are Terminated due to OOM, check events `kubectl get events`, increase memory limits or reduce replicas.
  - Example scenario 3 - Node affinity: If contention on one node, spread pods with affinity rules or taints (e.g., `kubectl taint nodes <node> key=value:NoSchedule` and add toleration).
  - Verify: `kubectl get pods` (more pods Running post-optimization).
  - Expected output: Contention causes scheduling issues, resolved by adjusting resources or policies, leading to stable pod states.

#### Day 25: Troubleshooting - Conduct Full Cluster Health Check
- **Challenge Overview**: Conduct a full cluster health check, identifying and fixing multiple issues.
- **Helpful Hints and Tips**:
  - Start with node status: `kubectl get nodes` (look for NotReady states).
  - Check control plane components in `kube-system` namespace with `kubectl get pods -n kube-system`.
  - Inspect workloads across namespaces for pod failures with `kubectl get pods --all-namespaces`.
  - Use a systematic checklist: nodes, control plane, networking, workloads, storage, and events.
- **Topics to Explore**:
  - Holistic cluster health monitoring.
  - Interdependencies between cluster components.
  - Prioritizing critical issues in troubleshooting.
- **Grading Criteria**:
  - Multiple cluster issues simulated or identified (e.g., node down, pod failing, verified with status commands).
  - Systematic diagnosis performed (document steps and findings from `kubectl get` and `describe`).
  - Issues resolved or mitigated (confirm with health indicators like `kubectl get nodes` and pod status).
- **Solution**:
  - Simulate issues for practice if cluster is healthy:
    - Node issue: Stop kubelet on a node `systemctl stop kubelet` (on node, if accessible).
    - Component issue: Delete a CoreDNS pod `kubectl delete pod -l k8s-app=coredns -n kube-system` (will restart with issue if misconfigured).
    - Workload issue: Deploy a failing app as in Day 23.
  - Checklist for health check:
    1. Nodes: `kubectl get nodes` (NotReady node? Check kubelet status or network).
    2. Control Plane: `kubectl get pods -n kube-system` (Crashing API server? Check logs `kubectl logs <apiserver-pod> -n kube-system`).
    3. Networking: Test pod-to-pod `kubectl exec <pod> -- ping <other-pod-ip>` (fails? Check CNI pods or policies).
    4. Workloads: `kubectl get pods --all-namespaces` (Pending/CrashLoop? Describe for reasons).
    5. Storage: `kubectl get pvc --all-namespaces` (unbound claims? Check PVs or provisioner).
    6. Events: `kubectl get events --sort-by=.metadata.creationTimestamp` (recent errors?).
  - Example scenario 1 - Node NotReady: Restart kubelet `systemctl start kubelet` on node, check logs `journalctl -u kubelet`.
  - Example scenario 2 - DNS failure: If CoreDNS down, check config `kubectl describe configmap coredns -n kube-system`, redeploy if needed.
  - Example scenario 3 - Pod scheduling failure: If pods Pending, check taints `kubectl describe nodes` and remove unnecessary ones `kubectl taint nodes <node> key:NoSchedule-`.
  - Verify fixes: Repeat checklist commands to ensure all components healthy.
  - Expected output: Multiple issues identified (e.g., node, DNS, workload), resolved systematically, cluster returns to stable state.

#### Day 26: Cluster Architecture, Installation & Configuration - Implement CRD and Operator
- **Challenge Overview**: Implement a Custom Resource Definition (CRD) and deploy an operator to manage custom resources.
- **Helpful Hints and Tips**:
  - Use a simple operator example like `kubebuilder` or an existing one (e.g., Prometheus Operator) for homelab.
  - Define a CRD YAML with schema for custom resource properties.
  - Install operator via Helm or manifests to handle CRD instances.
  - Create a custom resource instance and verify operator action with `kubectl get <custom-resource>`.
- **Topics to Explore**:
  - Custom Resource Definitions and their role in extending Kubernetes.
  - Operator pattern for automating resource management.
  - CRD versioning and validation.
- **Grading Criteria**:
  - CRD defined and applied (verify with `kubectl get crd`).
  - Operator installed to manage CRD (check operator pods with `kubectl get pods`).
  - Custom resource created and managed by operator (confirm with resource status or operator logs).
- **Solution**:
  - Use Prometheus Operator as an example (simplified for homelab).
  - Install via Helm: `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts` and `helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName=local-path --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=1Gi`.
  - Check CRDs: `kubectl get crd | grep monitoring` (shows Prometheus, ServiceMonitor, etc.).
  - Verify operator: `kubectl get pods -n monitoring` (operator and Prometheus pods Running).
  - Create a custom resource (ServiceMonitor to monitor a service):
    ```yaml
    apiVersion: monitoring.coreos.com/v1
    kind: ServiceMonitor
    metadata:
      name: example-app
      namespace: monitoring
      labels:
        team: frontend
    spec:
      selector:
        matchLabels:
          app: example-app
      endpoints:
      - port: web
    ```
  - Apply (adjust selector to match an existing service): `kubectl apply -f servicemonitor.yaml`.
  - Check operator action: `kubectl logs -l app.kubernetes.io/name=prometheus-operator -n monitoring` (should show reconciliation of ServiceMonitor).
  - Expected output: CRD and operator installed, custom resource (ServiceMonitor) created, and operator manages it (visible in logs or Prometheus UI if accessible).

#### Day 27: Cluster Architecture, Installation & Configuration - Simulate Cluster Upgrade
- **Challenge Overview**: Simulate a cluster upgrade using kubeadm and document the process for rollback if needed.
- **Helpful Hints and Tips**:
  - Check current cluster version with `kubectl version` or `kubeadm version`.
  - Plan upgrade path following Kubernetes version skew policy (e.g., minor version increments).
  - Use `kubeadm upgrade plan` to see available versions and prerequisites.
  - Backup etcd data and kubeconfig before upgrade (`cp -r /etc/kubernetes /etc/kubernetes.bak` on control plane).
- **Topics to Explore**:
  - Kubernetes version compatibility and skew policies.
  - Upgrade sequence for control plane and worker nodes.
  - Rollback strategies post-upgrade failure.
- **Grading Criteria**:
  - Upgrade plan reviewed (output of `kubeadm upgrade plan` documented).
  - Control plane upgraded (verify with `kubectl version` showing new version on master).
  - Worker nodes upgraded and cluster functional (confirm with `kubectl get nodes` showing consistent versions).
- **Solution**:

- Start by checking current version: `kubectl version` or `kubeadm version`.
  - Backup critical data on control plane node: `sudo cp -r /etc/kubernetes /etc/kubernetes.bak` and save `/root/.kube/config` if customized.
  - Check upgrade options: `kubeadm upgrade plan` (lists target versions and prerequisites like package updates).
  - Upgrade control plane (example from v1.22 to v1.23, adjust based on your version):
    - Update packages: `sudo apt update && sudo apt install -y kubeadm=1.23.0-00`.
    - Upgrade: `sudo kubeadm upgrade apply v1.23.0`.
  - Upgrade kubelet and kubectl on control plane: `sudo apt install -y kubelet=1.23.0-00 kubectl=1.23.0-00`.
  - Repeat for worker nodes: Drain node `kubectl drain <node> --ignore-daemonsets`, update packages, `sudo kubeadm upgrade node`, update kubelet, uncordon `kubectl uncordon <node>`.
  - Verify: `kubectl get nodes` (all nodes show new version in status).
  - Rollback plan (if issues): Downgrade packages to previous version, restore `/etc/kubernetes` backup, and reinitialize if needed (note: rollback may require cluster reset in homelab).
  - Expected output: Cluster upgraded to target version, all nodes consistent and Ready, workloads operational post-upgrade.

#### Day 28: Storage - Manage Persistent Volumes Manually
- **Challenge Overview**: Manage Persistent Volumes manually, binding them to PVCs, and test data persistence across pod restarts.
- **Helpful Hints and Tips**:
  - Create a Persistent Volume (PV) manually with specific storage details (e.g., `hostPath` for homelab) using YAML.
  - Define a Persistent Volume Claim (PVC) to request storage matching PV specs.
  - Bind PV to PVC manually if not automatic by ensuring specs align (e.g., storage size, access mode).
  - Test persistence by writing data to a pod's mounted volume, deleting the pod, and verifying data in a new pod.
- **Topics to Explore**:
  - Manual vs. dynamic provisioning of storage.
  - PV and PVC lifecycle and binding states.
  - Data persistence strategies in Kubernetes.
- **Grading Criteria**:
  - PV created manually (verify with `kubectl get pv` showing Available status initially).
  - PVC created and bound to PV (check with `kubectl get pvc` showing Bound status).
  - Data persistence confirmed (e.g., file survives pod restart, tested with read/write operations).
- **Solution**:
  - Create a manual PV with `hostPath` (for homelab):
    ```yaml
    apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: manual-pv
    spec:
      capacity:
        storage: 1Gi
      accessModes:
        - ReadWriteOnce
      persistentVolumeReclaimPolicy: Retain
      hostPath:
        path: /mnt/data
        type: DirectoryOrCreate
    ```
  - Apply: `kubectl apply -f manual-pv.yaml`.
  - Create a PVC to claim it:
    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: manual-pvc
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
    ```
  - Apply: `kubectl apply -f manual-pvc.yaml`.
  - Check binding: `kubectl get pvc manual-pvc` (should show Bound to `manual-pv`).
  - Deploy a pod to use PVC:
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: test-persistence
    spec:
      containers:
      - name: busybox
        image: busybox
        command: ["/bin/sh", "-c", "echo 'test data' > /data/test.txt && sleep 3600"]
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: manual-pvc
    ```
  - Apply: `kubectl apply -f test-pod.yaml`.
  - Verify data: `kubectl exec test-persistence -- cat /data/test.txt` (shows 'test data').
  - Delete pod: `kubectl delete pod test-persistence`.
  - Redeploy same pod spec, recheck data: `kubectl apply -f test-pod.yaml` and `kubectl exec test-persistence -- cat /data/test.txt` (data persists).
  - Expected output: PV and PVC bound, data written to volume persists across pod restarts.

#### Day 29: Review and Mock Exam - Review Key Concepts
- **Challenge Overview**: Review key concepts from all domains and revisit challenging tasks from previous days.
- **Helpful Hints and Tips**:
  - Revisit your progress log or notes from each day to identify areas of weakness (e.g., frequent issues in Troubleshooting or Storage).
  - Focus on high-weight domains like Troubleshooting (30%) and Cluster Architecture (25%) for deeper review.
  - Use official Kubernetes documentation to clarify concepts (e.g., RBAC, Network Policies).
  - Repeat tasks from earlier days if needed (e.g., Day 1 cluster setup, Day 10 node failure) to reinforce skills.
- **Topics to Explore**:
  - Recap of all CKA domains: Storage, Troubleshooting, Workloads & Scheduling, Cluster Architecture, Services & Networking.
  - Cross-domain interactions (e.g., how networking impacts workloads).
  - Exam format and time management strategies.
- **Grading Criteria**:
  - Key concepts from each domain reviewed (document a summary or checklist of revisited topics).
  - Weak areas identified and revisited (note specific days or tasks repeated).
  - Confidence level assessed for each domain (self-evaluate readiness per competency).
- **Solution**:
  - Create a review checklist based on CKA competencies:
    - **Storage (10%)**: Dynamic provisioning (Day 8), volume types (Day 9), manual PV management (Day 28).
    - **Troubleshooting (30%)**: Node failure (Day 10), component issues (Day 11), service/networking (Day 13, 22), deployment failures (Day 23), performance (Day 24), full health check (Day 25).
    - **Workloads & Scheduling (15%)**: Affinity (Day 4), resources (Day 5), updates/rollbacks (Day 20), autoscaling (Day 21).
    - **Cluster Architecture (25%)**: Cluster setup/HA (Days 1-2), RBAC (Day 3), Helm/Kustomize (Days 14-15), CNI/CRD/operators (Days 16, 26), upgrades (Day 27).
    - **Services & Networking (20%)**: Service types (Day 6), Network Policies (Day 7), Ingress/Gateway (Days 17-18), CoreDNS (Day 19).
  - Revisit notes or logs from each day, focusing on errors encountered (e.g., if Day 11 component troubleshooting was challenging, redo log analysis steps).
  - Access Kubernetes docs (kubernetes.io) for unclear topics like CRDs or Gateway API.
  - Repeat a complex task if needed: e.g., reset a node (Day 10) or reapply a Network Policy (Day 7) to test restrictions.
  - Self-assess: Rate understanding 1-5 per domain, plan extra time for scores below 3.
  - Expected output: Comprehensive review completed, weak areas strengthened through repetition, readiness assessed for mock exam.

#### Day 30: Review and Mock Exam - Perform Mock Exam Scenario
- **Challenge Overview**: Perform a mock exam scenario by combining tasks from multiple domains under a time limit.
- **Helpful Hints and Tips**:
  - Set a time limit (e.g., 2 hours) to simulate CKA exam pressure (actual exam is ~2 hours for multiple tasks).
  - Combine tasks across domains: deploy an app (Workloads), configure networking (Services), add storage (Storage), secure with RBAC (Architecture), and troubleshoot an issue (Troubleshooting).
  - Use only built-in tools (`kubectl`, basic shell commands) as per exam constraints, no external aids.
  - Document steps and issues during the mock to review post-exam for improvement.
- **Topics to Explore**:
  - Time management under exam conditions.
  - Prioritizing tasks based on dependencies (e.g., networking before app deployment).
  - Handling multi-domain problems efficiently.
- **Grading Criteria**:
  - Mock exam completed within time limit (e.g., 2 hours, self-timed).
  - Tasks from multiple domains attempted (verify completion of deployment, networking, storage, RBAC, troubleshooting components).
  - Success rate assessed (e.g., 80% tasks working as intended, self-evaluated against expected outputs).
- **Solution**:
  - Set timer for 2 hours. Scenario: Deploy a multi-tier app with constraints.
  - **Task 1 - Cluster Architecture (RBAC)** (10 min):
    - Create a Role for namespace `exam-ns` allowing only pod read access: `kubectl create role pod-reader --verb=get,list --resource=pods -n exam-ns`.
    - Bind to a user: `kubectl create rolebinding pod-reader-user --role=pod-reader --user=exam-user -n exam-ns`.
    - Test (if possible): `kubectl auth can-i get pods -n exam-ns --as=exam-user` (should be yes).
  - **Task 2 - Workloads & Scheduling** (20 min):
    - Deploy a frontend app in `exam-ns`: `kubectl create deployment frontend --image=nginx --replicas=2 -n exam-ns`.
    - Set resource limits: `kubectl edit deployment frontend -n exam-ns` (add CPU request 200m, limit 500m).
    - Verify: `kubectl get pods -n exam-ns` (Running with resources).
  - **Task 3 - Services & Networking** (20 min):
    - Expose frontend as ClusterIP: `kubectl expose deployment frontend --port=80 --name=frontend-svc -n exam-ns`.
    - Add Ingress: Create YAML for Ingress routing `/frontend` to `frontend-svc` (as in Day 17, adjust namespace).
    - Test internally: `kubectl run test-pod -n exam-ns --image=busybox -- /bin/sh -c "wget -qO- frontend-svc:80"` (should respond).
  - **Task 4 - Storage** (15 min):
    - Create PVC for backend data: Use `local-path` StorageClass (Day 8), request 500Mi in `exam-ns`.
    - Deploy backend pod using PVC (e.g., busybox writing data as in Day 28).
    - Verify persistence: Delete and recreate pod, check data.
  - **Task 5 - Troubleshooting** (25 min):
    - Simulate issue: Edit `frontend-svc` to wrong selector `app=wrong` with `kubectl edit svc frontend-svc -n exam-ns`.
    - Diagnose: Access fails from test-pod, check `kubectl describe svc frontend-svc -n exam-ns` (no endpoints), check selectors `kubectl get pods --show-labels -n exam-ns`.
    - Fix: Correct selector to `app=frontend` in service.
    - Retest: Access succeeds.
  - Post-exam (10 min): Review errors, missed steps, time overruns.
  - Expected output: Most tasks completed (e.g., app deployed, networking configured, issue fixed) within 2 hours, gaps identified for final prep.
