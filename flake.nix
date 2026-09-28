{
  description = "Development environment for the OpenQuest Foundry VTT system";

  inputs = {
    foundry-dev.url = "github:michalzc/foundry-dev";
    nixpkgs.follows = "foundry-dev/nixpkgs";
  };

  outputs =
    { foundry-dev, nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      env = foundry-dev.lib.mkFoundryEnvironment {
        inherit system;
        foundry = {
          version = "13.351";
          sha256 = "sha256-BWxKwTqjVQwzY0euV0/oWEXKVM7cYWdCfjBihRNsqQA=";
        };
        nodejsMajor = 22;
        port = 32000;
        extraPackages = [ (pkgs.yarn.override { nodejs = pkgs.nodejs_22; }) ];
        shellHook = ''
          export FOUNDRY_WORLD="''${FOUNDRY_WORLD-oq-dev}"
        '';
      };
    in
    {
      devShells.${system} = {
        default = env.devShell;
        foundry = env.devShell;
      };
      apps.${system}.start-foundry = env.app;
      packages.${system} = {
        foundryvtt = env.package;
        foundryvtt-13 = env.package;
        start-foundry = env.launcher;
      };
      formatter.${system} = env.formatter;
    };
}
