package com.kimbia.backend.service;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class LocalStorageService implements StorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:}")
    private String configuredBaseUrl;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp", ".gif");

    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(path);
            log.info("Initialized local file storage at: {}", path);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory at: " + uploadDir, e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, HttpServletRequest request) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Invalid file type: Only image uploads are allowed");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.png");
        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence: " + originalFilename);
        }

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            if (contentType.equals("image/jpeg")) {
                extension = ".jpg";
            } else if (contentType.equals("image/png")) {
                extension = ".png";
            } else if (contentType.equals("image/webp")) {
                extension = ".webp";
            } else if (contentType.equals("image/gif")) {
                extension = ".gif";
            } else {
                extension = ".png";
            }
        }

        String storedFileName = UUID.randomUUID().toString() + extension;

        try {
            Path targetDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored uploaded file {} as {}", originalFilename, targetPath);

            if (StringUtils.hasText(configuredBaseUrl)) {
                String base = configuredBaseUrl.endsWith("/") ? configuredBaseUrl.substring(0, configuredBaseUrl.length() - 1) : configuredBaseUrl;
                return base + "/uploads/" + storedFileName;
            }

            if (request != null) {
                return ServletUriComponentsBuilder.fromContextPath(request)
                        .path("/uploads/")
                        .path(storedFileName)
                        .toUriString();
            }

            return "/uploads/" + storedFileName;
        } catch (IOException ex) {
            log.error("Failed to store file {}", originalFilename, ex);
            throw new RuntimeException("Could not store file: " + originalFilename, ex);
        }
    }
}
