#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Copyright : Emmanuel Coquery

import argparse
import csv
import uuid
import logging

salt = uuid.UUID("3cd5b9e6-4950-11e9-af99-6a0002a2a1f0")


def handle_line(line, id_col, writer):
    if id_col is None:
        id_col = 0
    id_val = line[id_col]
    apikey = str(uuid.uuid5(salt, id_val))
    writer.writerow([id_val, apikey])


def generate(inputFile, outputFile):
    reader = csv.reader(inputFile, delimiter="\t")
    writer = csv.writer(outputFile, delimiter="\t")
    logging.debug("Files opened")
    id_col = None
    for line in reader:
        if id_col is None:
            if any(map(lambda v: v == "ID", line)):
                for i in range(len(line)):
                    if line[i] == "ID":
                        id_col = i
                        break
            else:
                id_col = 0
                handle_line(line, id_col, writer)
        else:
            handle_line(line, id_col, writer)


def main():
    parser = argparse.ArgumentParser(description="generate API keys for the project")
    parser.add_argument(
        "inputFile",
        type=argparse.FileType("r", encoding="UTF-8"),
        help="TSV file containing students IDs as the first column",
    )
    parser.add_argument(
        "outputFile",
        type=argparse.FileType("w", encoding="UTF-8"),
        help="TSV file containing students IDs and password that can be used for tomuss import",
    )
    args = parser.parse_args()
    logging.basicConfig(level=logging.DEBUG)
    generate(args.inputFile, args.outputFile)


if __name__ == "__main__":
    main()
