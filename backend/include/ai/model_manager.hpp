#pragma once

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <mutex>
#include <filesystem>
#include <optional>
#include <cstdint>
#include <chrono>
#include "nlohmann/json.hpp"

namespace CaramelPepper::AI {

/**
 * @enum KeyValidationStatus
 * @brief Formal verification state for remote provider API keys.
 */
enum class KeyValidationStatus {
    VALID,
    INVALID_KEY,
    EXPIRED,
    QUOTA_EXCEEDED,
    NETWORK_ERROR,
    UNTESTED
};

/**
 * @struct ModelMetadata
 * @brief Detailed descriptors for local .gguf binaries and remote provider endpoints.
 */
struct ModelMetadata {
    std::string id;              // Unique identifier (e.g., "qwen2.5-coder-1.5b-instruct-q4_k_m")
    std::string name;            // Human-readable display name
    std::string filename;        // Filename on disk (e.g., "qwen2.5-coder-1.5b.gguf")
    std::string path;            // Absolute or relative path to .gguf file
    uint64_t sizeBytes{0};       // Size in bytes
    std::string sizeFormatted;   // Formatted file size string (e.g., "1.5 GB")
    uint32_t ramRequiredMB{0};   // Estimated RAM/VRAM required (MB)
    std::string quantization;    // Quantization tag (e.g., "Q4_K_M", "Q8_0", "F16")
    std::string status;          // "Loaded", "Available", "Unloaded"
    bool isLocal{true};          // True for local GGUF, false for Cloud API
    std::string provider;        // "local", "openai", "anthropic", "gemini", "openrouter"
    std::string description;     // Architectural overview / context window
};

/**
 * @struct KeyValidationResult
 * @brief Structured outcome of lightweight token probe / verification check.
 */
struct KeyValidationResult {
    std::string provider;
    KeyValidationStatus status{KeyValidationStatus::UNTESTED};
    std::string statusString;    // "VALID", "INVALID_KEY", "EXPIRED", "QUOTA_EXCEEDED", "NETWORK_ERROR"
    std::string maskedKey;       // Masked representation (e.g., "sk-****...****")
    std::string message;
};

/**
 * @class ModelManager
 * @brief Central orchestrator for dynamic model discovery, llama.cpp lifecycle management,
 *        thread-safe hot-swapping, and zero-egress key vault enforcement.
 */
class ModelManager {
public:
    explicit ModelManager(std::string modelsDir = "backend/models", 
                          std::string configPath = ".caramelpepper/config.json");
    ~ModelManager();

    // Model Discovery
    std::vector<ModelMetadata> discoverLocalModels();
    std::vector<ModelMetadata> getAllModels();
    nlohmann::json getAvailableModelsJson();

    // Memory Management & Hot-Swapping
    bool selectModel(const std::string& modelId, const std::string& provider = "");
    void unloadCurrentModel();
    std::optional<ModelMetadata> getActiveModel() const;
    bool isLocalActive() const;

    // Secure Key Management
    void setApiKey(const std::string& provider, const std::string& key);
    std::string getApiKey(const std::string& provider) const;
    std::map<std::string, bool> getKeyConfigurationStatus() const;
    std::map<std::string, std::string> getMaskedKeyStatus() const;

    // Key Validation Engine
    KeyValidationResult validateApiKey(const std::string& provider, const std::string& key);

    // Sanitization & Security Utilities
    static std::string maskApiKey(const std::string& key);
    static std::string sanitizeLogString(const std::string& input);

private:
    std::string modelsDirectory;
    std::string configurationFilePath;
    std::string activeModelId;
    std::string activeProvider;
    bool isModelLoadedInVram{false};

    // Thread safety synchronization
    mutable std::mutex managerMutex;

    // Internal In-Memory Key Vault
    std::map<std::string, std::string> providerKeys;
    std::map<std::string, KeyValidationStatus> keyValidationStatuses;

    // Internal Helpers
    void initializeEnvironmentKeys();
    void loadEncryptedConfig();
    void persistEncryptedConfig();
    void loadDotEnvIfPresent();

    // Quantization & Metadata extractors
    static std::string extractQuantizationTag(const std::string& filename);
    static std::string formatReadableModelName(const std::string& filename);
    static std::string formatBytes(uint64_t bytes);
    static uint32_t estimateVramMb(uint64_t fileSizeBytes);
    
    // Remote Model Catalog
    std::vector<ModelMetadata> getRemoteModelCatalog() const;
};

} // namespace CaramelPepper::AI
