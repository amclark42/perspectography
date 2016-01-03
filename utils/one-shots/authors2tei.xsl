<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="xs xsl tei"
  version="2.0">
  
  <xsl:output indent="yes" method="xml"/>
  
  <xsl:template match="text()" mode="#all">
    <xsl:if test="string-length(normalize-space()) > 1">
      <xsl:value-of select="."/>
    </xsl:if>
  </xsl:template>
  <xsl:template match="*" priority="-5" mode="#all">
    <xsl:apply-templates select="*" mode="#current"/>
  </xsl:template>
  
  <xsl:template match="/">
    <xsl:processing-instruction name="xml-model">href="file:/media/removable/SD%20Card/out/perspectography.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"</xsl:processing-instruction>
    <TEI xmlns="http://www.tei-c.org/ns/1.0">
      <teiHeader>
        <fileDesc>
          <titleStmt>
            <title>Books I've Read 3.2</title>
          </titleStmt>
          <publicationStmt><p>Just me, Ashley.</p></publicationStmt>
          <sourceDesc><p>None</p></sourceDesc>
        </fileDesc>
      </teiHeader>
      <text>
        <body>
          <listPerson>
            <xsl:apply-templates/>
          </listPerson>
          <listOrg>
            <xsl:apply-templates mode="org"/>
          </listOrg>
        </body>
      </text>
    </TEI>
  </xsl:template>
  
  <!--<xsl:template match="book">
    <biblStruct>
      <xsl:copy-of select="@xml:id"/>
      <monogr>
        <xsl:apply-templates select="* except (series | tag)"/>
        <imprint>
          <xsl:if test="tags">
            <xsl:apply-templates select="tags/tag"/>
          </xsl:if>
          <publisher></publisher>
        </imprint>
      </monogr>
      <xsl:apply-templates select="series"/>
    </biblStruct>
  </xsl:template>-->
  
  <xsl:template match="relation"/>
  
  <xsl:template match="contributor/name">
    <person xml:id="{@xml:id}">
      <persName>
        <xsl:apply-templates/>
      </persName>
    </person>
  </xsl:template>
  
  <xsl:template match="forename|surname">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>
  
  <xsl:template match="orgName" mode="org">
    <orgName xml:id="{@xml:id}">
      <xsl:apply-templates mode="org"/>
    </orgName>
  </xsl:template>
  
  <xsl:template match="orgName/name" mode="org">
    <xsl:copy>
      <xsl:apply-templates mode="org"/>
    </xsl:copy>
  </xsl:template>
  
</xsl:stylesheet>