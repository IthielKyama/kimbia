package com.kimbia.backend.controller;

import com.kimbia.backend.service.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UploadControllerTest {

    @Mock
    private StorageService storageService;

    private UploadController uploadController;

    @BeforeEach
    void setUp() {
        uploadController = new UploadController(storageService);
    }

    @Test
    void uploadFile_success_returnsCreatedAndFileUrl() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "photo.jpg",
                "image/jpeg",
                "image-bytes".getBytes()
        );
        MockHttpServletRequest request = new MockHttpServletRequest();

        when(storageService.storeFile(eq(file), any())).thenReturn("http://localhost:8081/uploads/test.jpg");

        ResponseEntity<?> response = uploadController.uploadFile(file, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("http://localhost:8081/uploads/test.jpg", body.get("file_url"));
    }

    @Test
    void uploadFile_emptyFile_returnsBadRequest() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );
        MockHttpServletRequest request = new MockHttpServletRequest();

        ResponseEntity<?> response = uploadController.uploadFile(file, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
