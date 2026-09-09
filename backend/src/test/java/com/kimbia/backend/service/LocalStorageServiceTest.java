package com.kimbia.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class LocalStorageServiceTest {

    private LocalStorageService storageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        storageService = new LocalStorageService();
        ReflectionTestUtils.setField(storageService, "uploadDir", tempDir.toString());
        storageService.init();
    }

    @Test
    void storeFile_validImage_returnsUrl() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-bib.png",
                "image/png",
                "fake image content".getBytes()
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        String fileUrl = storageService.storeFile(file, request);

        assertNotNull(fileUrl);
        assertTrue(fileUrl.contains("/uploads/"));
        assertTrue(fileUrl.endsWith(".png"));
    }

    @Test
    void storeFile_emptyFile_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.png",
                "image/png",
                new byte[0]
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        assertThrows(IllegalArgumentException.class, () -> storageService.storeFile(file, request));
    }

    @Test
    void storeFile_nonImage_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "script.js",
                "application/javascript",
                "console.log('hi');".getBytes()
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        assertThrows(IllegalArgumentException.class, () -> storageService.storeFile(file, request));
    }
}
