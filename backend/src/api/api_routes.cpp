#include "crow.h"
#include "ai/model_manager.hpp"
#include "nlohmann/json.hpp"
#include <iostream>
#include <string>

namespace CaramelPepper::API {

using json = nlohmann::json;

/**
 * @file api_routes.cpp
 * @brief Crow endpoints for Dynamic Model Selection, Llama.cpp Memory Hot-Swapping,
 *        and API Key Validation.
 */

// Global or shared model manager reference
static CaramelPepper::AI::ModelManager globalModelManager;

/**
 * GET /api/models
 * Discovers local .gguf models in backend/models and dynamically appends
 * configured cloud providers.
 */
crow::response handleGetModels() {
    try {
        json modelsJson = globalModelManager.getAvailableModelsJson();
        crow::response res(200, modelsJson.dump());
        res.set_header("Content-Type", "application/json");
        return res;
    } catch (const std::exception& e) {
        json err;
        err["error"] = "Failed to discover models";
        err["details"] = CaramelPepper::AI::ModelManager::sanitizeLogString(e.what());
        crow::response res(500, err.dump());
        res.set_header("Content-Type", "application/json");
        return res;
    }
}

/**
 * POST /api/models/select
 * Safely hot-swaps active inference model. Deallocates previous llama.cpp VRAM
 * context before loading target weights.
 */
crow::response handleSelectModel(const crow::request& req) {
    auto body = crow::json::load(req.body);
    if (!body || !body.has("modelId")) {
        json err;
        err["error"] = "Invalid request payload. 'modelId' is required.";
        crow::response res(400, err.dump());
        res.set_header("Content-Type", "application/json");
        return res;
    }

    std::string modelId = body["modelId"].s();
    std::string provider = body.has("provider") ? std::string(body["provider"].s()) : "";

    try {
        bool success = globalModelManager.selectModel(modelId, provider);
        if (success) {
            auto activeModel = globalModelManager.getActiveModel();
            json resp;
            resp["success"] = true;
            resp["message"] = "Model hot-swapped successfully";
            resp["modelId"] = modelId;
            resp["isLocal"] = globalModelManager.isLocalActive();
            if (activeModel.has_value()) {
                json m;
                m["id"] = activeModel->id;
                m["name"] = activeModel->name;
                m["quantization"] = activeModel->quantization;
                m["ramRequiredMB"] = activeModel->ramRequiredMB;
                m["sizeFormatted"] = activeModel->sizeFormatted;
                m["provider"] = activeModel->provider;
                resp["activeModel"] = m;
            }
            crow::response res(200, resp.dump());
            res.set_header("Content-Type", "application/json");
            return res;
        } else {
            json err;
            err["success"] = false;
            err["error"] = "Failed to switch model. Provider credentials may be missing or file unreadable.";
            crow::response res(400, err.dump());
            res.set_header("Content-Type", "application/json");
            return res;
        }
    } catch (const std::exception& e) {
        json err;
        err["success"] = false;
        err["error"] = CaramelPepper::AI::ModelManager::sanitizeLogString(e.what());
        crow::response res(500, err.dump());
        res.set_header("Content-Type", "application/json");
        return res;
    }
}

/**
 * POST /api/keys/validate
 * Validates entered API keys with a lightweight verification probe before saving.
 * Status values: VALID, INVALID_KEY, EXPIRED, QUOTA_EXCEEDED, NETWORK_ERROR
 */
crow::response handleValidateKey(const crow::request& req) {
    auto body = crow::json::load(req.body);
    if (!body || !body.has("provider") || !body.has("key")) {
        json err;
        err["error"] = "Invalid request payload. 'provider' and 'key' are required.";
        crow::response res(400, err.dump());
        res.set_header("Content-Type", "application/json");
        return res;
    }

    std::string provider = body["provider"].s();
    std::string key = body["key"].s();

    try {
        auto result = globalModelManager.validateApiKey(provider, key);

        json resp;
        resp["provider"] = result.provider;
        resp["status"] = result.statusString;
        resp["maskedKey"] = result.maskedKey;
        resp["message"] = result.message;

        int httpStatus = (result.status == CaramelPepper::AI::KeyValidationStatus::VALID) ? 200 : 422;
        crow::response res(httpStatus, resp.dump());
        res.set_header("Content-Type", "application/json");
        return res;
    } catch (const std::exception& e) {
        json err;
        err["error"] = "Key validation failed";
        err["details"] = CaramelPepper::AI::ModelManager::sanitizeLogString(e.what());
        crow::response res(500, err.dump());
        res.set_header("Content-Type", "application/json");
        return res;
    }
}

/**
 * GET /api/keys/status
 * Returns masked key statuses for all providers.
 */
crow::response handleGetMaskedKeysStatus() {
    try {
        auto maskedMap = globalModelManager.getMaskedKeyStatus();
        auto configMap = globalModelManager.getKeyConfigurationStatus();

        json resp = json::object();
        for (const auto& [p, isConfigured] : configMap) {
            json item;
            item["configured"] = isConfigured;
            item["maskedKey"] = maskedMap[p];
            resp[p] = item;
        }

        crow::response res(200, resp.dump());
        res.set_header("Content-Type", "application/json");
        return res;
    } catch (const std::exception& e) {
        json err;
        err["error"] = CaramelPepper::AI::ModelManager::sanitizeLogString(e.what());
        crow::response res(500, err.dump());
        res.set_header("Content-Type", "application/json");
        return res;
    }
}

/**
 * Registers all model management and key validation routes onto the Crow app.
 */
void registerModelManagementRoutes(crow::SimpleApp& app) {
    // Model Discovery
    CROW_ROUTE(app, "/api/models").methods(crow::HTTPMethod::GET)([]() {
        return handleGetModels();
    });

    // Model Hot-Swapping
    CROW_ROUTE(app, "/api/models/select").methods(crow::HTTPMethod::POST)([](const crow::request& req) {
        return handleSelectModel(req);
    });

    // API Key Validation
    CROW_ROUTE(app, "/api/keys/validate").methods(crow::HTTPMethod::POST)([](const crow::request& req) {
        return handleValidateKey(req);
    });

    // API Key Status
    CROW_ROUTE(app, "/api/keys/status").methods(crow::HTTPMethod::GET)([]() {
        return handleGetMaskedKeysStatus();
    });
}

} // namespace CaramelPepper::API
