{
  stdenv,
  requireFile,
  unzip,
  makeWrapper,
  nodejs,
  ...
}:
{ version, shortVersion, sha256 }: stdenv.mkDerivation rec {
  pname = "foundryvtt";
  inherit version;

  src = requireFile {
    name = "FoundryVTT-${version}.zip";
    inherit sha256;
    url = "https://foundryvtt.com";
    message = ''
      No foundry zip archive FoundryVTT-${version} found in the store.
      Download it and add to store: nix-store --add-fixed sha256 FoundryVTT-${version}.zip
    '';
  };

  nativeBuildInputs = [
    unzip
    makeWrapper
  ];
  dontUnpack = true;


  installPhase = ''
    FVTT=$out/opt/foundryvtt-''${version}
    mkdir -p $FVTT
    unzip $src -d $FVTT


    mkdir -p $out/bin
    MPATH=$(test -f $FVTT/main.js && echo $FVTT/main.js || echo $FVTT/resources/app/main.js)

    makeWrapper ${nodejs}/bin/node $out/bin/foundryvtt-${shortVersion} \
      --add-flags "$MPATH"

  '';
}
