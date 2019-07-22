PANDOC=pandoc
PANDOCFLAGS=-f markdown -t html --toc --toc-depth=4 -s --highlight-style=tango 
MDEXT=md
HTMLEXT=html

FILE=README
DOC_SERVER=$(FILE).$(HTMLEXT)

all: $(DOC_SERVER)

$(DOC_SERVER): $(FILE).$(MDEXT) 
	$(PANDOC) $(PANDOCFLAGS) -o $(DOC_SERVER) $^

clean:
	find . -type f -name "*~" -delete
