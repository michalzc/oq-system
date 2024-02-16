import yaml
import plyvel
import sys
import json
import slugify
import os.path


def read_data(source_dir):
    db = plyvel.DB(source_dir)
    items = [(k.decode('UTF-8'), v.decode('UTF-8')) for k, v in db]
    db.close()
    return items


def main(source_dir, dest_dir, write=False):
    source_data = read_data(source_dir)
    out = [("%s.%s.yaml" % (d['fileType'], slugify.slugify(d['name'])), yaml.dump(d)) for d in
           [dict(v, fileType=k.split('!')[1], _stats=None, image=None) for k, v in
            [(k, json.loads(v)) for k, v in source_data]]]

    for file_name, yaml_data in out:
        out_file = os.path.join(dest_dir, file_name)
        with open(out_file, 'w') as f:
            f.write(yaml_data)


if __name__ == "__main__":
    main(*sys.argv[1:])
