xquery version "3.1";

  (:declare boundary-space preserve;:)
(:  NAMESPACES  :)
  declare default element namespace "http://www.tei-c.org/ns/1.0";
  declare namespace madsrdf="http://www.loc.gov/mads/rdf/v1#";
  declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
  declare namespace rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#";
  declare namespace skos="http://www.w3.org/2004/02/skos/core#";
  declare namespace tei="http://www.tei-c.org/ns/1.0";
(:  OPTIONS  :)
  (:declare option output:indent "no";:)

(:~
  Use the MARC relators defined by the Library of Congress to populate the value descriptions 
  for `//resp/@n`. This script updates the Perspectography ODD file.
  
  MARC Code List for Relators Scheme: http://id.loc.gov/vocabulary/relators
  
  @author Ashley M. Clark
  2020-03-07
 :)
 
(:  VARIABLES  :)
  
  (: The MARC Relators RDF/XML file. :)
  declare variable $relators-base-uri := "http://id.loc.gov/vocabulary/relators";
  declare variable $relators-rdf := doc(concat($relators-base-uri,".rdf"));
  (: The Perspectography ODD file. :)
  declare variable $perspectography-odd := doc("../../schema/perspectography.odd");


(:  MAIN QUERY  :)

let $oddTargets := $perspectography-odd/id('loc-relators')/valItem[@ident]
let $labels := $oddTargets/@ident/data(.)
return
  for $relation in $labels
  let $locUri := 
    let $authority :=
      $relators-rdf//madsrdf:Authority[madsrdf:authoritativeLabel/lower-case(.) eq $relation]
    return $authority/@rdf:about/data(.)
  (: Get the RDF/XML format for this relator's definition. :)
  let $fullUri := concat($locUri,'.rdf')
  return
    if ( not(doc-available($fullUri)) ) then ()
    else
      let $valDesc := $oddTargets[@ident eq $relation]/desc
      let $srcAttr := $valDesc/@source
      let $definition :=
        let $el := doc($fullUri)/rdf:RDF/madsrdf:Authority/madsrdf:definitionNote[@xml:lang eq 'en']
        let $defStr := normalize-space($el)
        return
          concat(lower-case(substring($defStr, 1, 1)), substring($defStr, 2), '.')
            => replace('([.])\.$', '$1')
      return (
        (: Update the description of the suggested attribute value. :)
        replace value of node $valDesc with $definition
        ,
        (: Add or update the @source attribute for the description; point back to the RDF URI. :)
        if ( exists($srcAttr) ) then
          replace value of node $srcAttr with $locUri
        else
          insert node attribute source { $locUri } into $valDesc
      )
