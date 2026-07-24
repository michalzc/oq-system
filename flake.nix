{
  description = "Env for oq-system";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
  };

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

      foundryvtt-13 = pkgs.callPackage ./nix/foundryvtt { nodejs = pkgs.nodejs_22; } {
        version = "13.351";
        shortVersion = "13";
        sha256 = "sha256-BWxKwTqjVQwzY0euV0/oWEXKVM7cYWdCfjBihRNsqQA=";
      };

      start-foundry = pkgs.writeShellScriptBin "start-foundry" ''
        exec ${foundryvtt-13}/bin/foundryvtt-13 \
          --port=31000 --world=mythras-test --dataPath=./foundryvtt-data "$@"
      '';
    in
    {
      packages.${system}.foundryvtt-13 = foundryvtt-13;

      devShells.${system}.default = pkgs.mkShell {

        packages = with pkgs; [
          nodejs_22
          (yarn.override { nodejs = nodejs_22; })
          foundryvtt-13
          start-foundry
        ];

        shellHook = ''
          echo "Entering dev env"
        '';
      };
    };
}
