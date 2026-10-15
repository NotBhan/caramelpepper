#include "crow.h"
#include "ai/model_manager.cpp"
#include "api/fs_handlers.cpp"
#include "api/handlers.cpp"
#include "api/api_routes.cpp"
#include <mutex>

/**
 * @file main.cpp
 * @brief Entry point for the CaramelPepper C++ backend server.
 */

static std::string currentWorkspaceRoot = "";
static std::mutex rootMutex;

int main() {
    crow::SimpleApp app;

    // AI Refactoring Endpoints
    CROW_ROUTE(app, "/api/refactor").methods(crow::HTTPMethod::POST)([](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x) return crow::response(400);
        
        CaramelPepper::API::RefactorRequest request;
        request.code = x["code"].s();
        request.engineType = x["engineType"].s();
        
        return crow::response(CaramelPepper::API::handleRefactorRequest(request));
    });

    // Dynamic Model Selection & API Key Management Routes
    CaramelPepper::API::registerModelManagementRoutes(app);

    // Vault/Settings Endpoints
    CROW_ROUTE(app, "/api/settings/keys").methods(crow::HTTPMethod::POST)([](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x) return crow::response(400);
        
        CaramelPepper::API::KeyStorageRequest request;
        request.provider = x["provider"].s();
        request.key = x["key"].s();
        
        return CaramelPepper::API::handleStoreKey(request) ? crow::response(200) : crow::response(400);
    });

    CROW_ROUTE(app, "/api/settings/keys/status")([]() {
        return crow::json::wvalue(CaramelPepper::API::handleGetKeyStatus());
    });

    // Workspace/Filesystem Endpoints
    CROW_ROUTE(app, "/api/workspace/set_root").methods(crow::HTTPMethod::POST)([](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x || !x.has("path")) return crow::response(400);
        
        std::string path = x["path"].s();
        if (!std::filesystem::exists(path)) {
            return crow::response(404, "Path does not exist");
        }

        std::lock_guard<std::mutex> lock(rootMutex);
        currentWorkspaceRoot = path;
        return crow::response(200);
    });

    CROW_ROUTE(app, "/api/workspace/tree")([](const crow::request& req) {
        std::string root;
        {
            std::lock_guard<std::mutex> lock(rootMutex);
            root = currentWorkspaceRoot;
        }
        auto pathParam = req.url_params.get("path");
        return crow::response(CaramelPepper::API::handleGetWorkspaceTree(pathParam ? pathParam : root));
    });

    CROW_ROUTE(app, "/api/workspace/read")([](const crow::request& req) {
        auto path = req.url_params.get("path");
        if (!path) return crow::response(400, "Missing path parameter");
        return crow::response(CaramelPepper::API::handleReadFile(path));
    });

    CROW_ROUTE(app, "/api/workspace/save").methods(crow::HTTPMethod::POST)([](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x) return crow::response(400);
        
        std::string path = x["path"].s();
        std::string content = x["content"].s();
        
        return CaramelPepper::API::handleSaveFile(path, content) ? crow::response(200) : crow::response(500);
    });

    app.port(18080).multithreaded().run();
}