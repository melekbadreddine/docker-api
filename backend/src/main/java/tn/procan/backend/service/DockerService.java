package tn.procan.backend.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.PullImageResultCallback;
import com.github.dockerjava.api.exception.DockerException;
import com.github.dockerjava.api.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class DockerService {

    private final DockerClient dockerClient;

    @Autowired
    public DockerService(DockerClient dockerClient) {
        this.dockerClient = dockerClient;
    }

    public List<Image> listImages() {
        return dockerClient.listImagesCmd().exec();
    }

    public boolean pullImage(String repository, String tag) throws InterruptedException {
        return dockerClient.pullImageCmd(repository)
                .withTag(tag)
                .exec(new PullImageResultCallback())
                .awaitCompletion(500, TimeUnit.SECONDS);
    }

    public void deleteImage(String imageName) {
        try {
            dockerClient.removeImageCmd(imageName).withForce(true).exec();
        } catch (DockerException e) {
            throw new RuntimeException("Failed to delete the image: " + imageName, e);
        }
    }

    public CreateContainerResponse createContainer(String imageName, int hostPort, int containerPort) {
        ExposedPort exposedPort = ExposedPort.tcp(containerPort);
        Ports portBindings = new Ports();
        portBindings.bind(exposedPort, Ports.Binding.bindPort(hostPort));

        return dockerClient.createContainerCmd(imageName)
                .withExposedPorts(exposedPort)
                .withHostConfig(HostConfig.newHostConfig().withPortBindings(portBindings))
                .exec();
    }

    public void startContainer(String containerId) {
        try {
            dockerClient.startContainerCmd(containerId).exec();
        } catch (DockerException e) {
            throw new RuntimeException("Failed to start the container: " + containerId, e);
        }
    }

    public List<Container> listContainers() {
        return dockerClient.listContainersCmd().withShowAll(true).exec();
    }

    public List<Container> listRunningContainers() {
        return dockerClient.listContainersCmd().exec();
    }

    public void stopContainer(String containerId) {
        try {
            dockerClient.stopContainerCmd(containerId).exec();
        } catch (DockerException e) {
            throw new RuntimeException("Failed to stop the container: " + containerId, e);
        }
    }

    public void deleteContainer(String containerId) {
        try {
            dockerClient.removeContainerCmd(containerId).withForce(true).exec();
        } catch (DockerException e) {
            throw new RuntimeException("Failed to delete the container: " + containerId, e);
        }
    }
}
